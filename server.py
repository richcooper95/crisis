import argparse
import json
import logging
import os
import sys
from collections import namedtuple
from typing import Collection, Dict, List, Optional, Tuple, Union

import sanic
import sanic.request
import sanic.response

logger = logging.getLogger(__name__)

app = sanic.Sanic("hello_example")

app.static("/", "build/")


# JSON type for coach data.
CoachJSON = Dict[str, Union[str, int, bool, float, "CoachJSON"]]

# ------------------------------------------------------------------------------
# Database
# ------------------------------------------------------------------------------


class Coach(
    namedtuple(
        "_Coach",
        [
            "id",
            "name",
            "bio",
            "available",
            "birth_year",
            "gender",
            "languages",
            "need",
            "rights",
            "housing",
        ],
    )
):
    """A coach object - an entry in the database."""

    def __new__(
        cls,
        *,
        id: Optional[int] = None,
        name: str,
        bio: str,
        available: bool = True,
        birth_year: int,
        gender: str,
        languages: Dict[str, int],
        need: Collection[int],
        rights: Collection[int],
        housing: Collection[int],
    ):
        # TODO: Validate args.
        return super().__new__(
            cls,
            id=id,
            name=name,
            bio=bio,
            available=available,
            birth_year=birth_year,
            gender=gender,
            languages=languages,
            need=need,
            rights=rights,
            housing=housing,
        )

    def to_json(self) -> CoachJSON:
        return self._asdict()

    @classmethod
    def from_json(cls, obj: CoachJSON) -> "Coach":
        return cls(**obj)

    def copy(self) -> "Coach":
        return self.from_json(self.to_json())


class CoachDB:
    """The in-memory coach database."""

    def __init__(
        self, file: Optional[os.PathLike] = None, *, auto_persist: bool = True
    ):
        """
        :param file:
            File to use as persistent storage of the DB. If not found it will be
            created.
        :param auto_persist:
            Whether to automatically persist the DB to file on operations that
            modify the DB. Ignored if file is not given.
            Set this to False if manual batching is desired.
        """
        self._db: Dict[int, Coach] = dict()
        self._file = file
        self._auto_persist = auto_persist and file
        self._next_id: int = 0
        if file:
            self._load_from_file(file)

    def __iter__(self):
        return iter(self._db.values())

    def __contains__(self, item: Union[int, Coach]):
        if item in self._db:
            return True
        elif isinstance(item, Coach):
            return item.id in self._db
        else:
            return False

    def add(self, coach: Coach) -> Coach:
        """Add a new coach to the DB, setting the ID."""
        assert self._next_id not in self._db
        if coach.id is not None:
            raise ValueError("Coach already has an ID assigned, not adding to DB")
        db_coach = Coach(**{**coach.to_json(), "id": self._next_id})
        self._next_id += 1
        self._db[db_coach.id] = db_coach
        logger.debug("Added coach with ID %d", db_coach.id)
        if self._auto_persist:
            self.persist(self._file)
        return db_coach

    def remove(self, coach_id: int):
        """Remove a coach from the DB by ID."""
        try:
            self._db.pop(coach_id)
        except KeyError:
            raise KeyError(f"Coach with ID '{coach_id}' not found")
        else:
            logger.debug("Removed coach with ID %d", coach_id)
        if self._auto_persist:
            self.persist(self._file)

    def get(self, coach_id: int) -> Coach:
        """Get a coach from the DB by ID."""
        return self._db[coach_id]

    def update_entry(self, coach: Coach) -> Coach:
        """Update a given coach entry."""
        if coach.id not in self._db:
            raise KeyError(f"Coach ID '{coach.id}' not found in DB")
        self._db[coach.id] = coach
        logger.debug("Updated coach with ID %d", coach.id)
        if self._auto_persist:
            self.persist(self._file)
        return coach

    def persist(self, file: os.PathLike) -> None:
        """Persist the database to a given file."""
        logger.debug("Saving coaches DB to file: %s", file)
        data = dict(next_id=self._next_id, data=[c.to_json() for c in self])
        with open(file, "w") as f:
            json.dump(data, f)

    def _load_from_file(self, file: os.PathLike):
        """Load data in from a given file, or create the file if it doesn't exist."""
        try:
            with open(file, "r") as f:
                data = json.load(f)
            logger.info("Loading in coaches DB from file: %s", file)
            self._db = {c["id"]: Coach.from_json(c) for c in data["data"]}
            self._next_id = data["next_id"]
        except FileNotFoundError:
            logger.info("Coaches DB file not found, creating now: %s", file)
            self.persist(file)


# The in-memory database of coaches.
coach_db: CoachDB

# The file used to persist the coach DB.
COACH_DB_FILE = "./coach_db.json"


# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------


def _parse_languages(languages: str) -> Dict[str, int]:
    ret = dict()
    if not languages:
        return ret
    for lang in languages.split(","):
        lang_name, proficiency = lang.split(":")
        ret[lang_name] = int(proficiency)
    return ret


# ------------------------------------------------------------------------------
# Route handlers
# ------------------------------------------------------------------------------


def get_coaches() -> List[Coach]:
    return list(coach_db)


def get_coach(coach_id: int) -> Coach:
    return coach_db.get(coach_id)


def create_coach(data: CoachJSON) -> Coach:
    coach = Coach(**data)
    db_coach = coach_db.add(coach)
    return db_coach


def edit_coach(coach_id: int, data: CoachJSON) -> Coach:
    kwargs = get_coach(coach_id).to_json()
    kwargs.update(data)
    updated_coach = Coach(**kwargs)
    db_coach = coach_db.update_entry(updated_coach)
    return db_coach


def delete_coach(coach_id: int) -> None:
    coach_db.remove(coach_id)


def get_coach_matches(data: CoachJSON) -> List[Tuple[int, Coach]]:
    """
    Get coaches based on how well they match the given data.

    :param data:
        Data to match on.
    :return:
        A list of tuples containing the match score and the matched coach.
    """

    def get_lang_match_score(c: Coach, languages: Dict[str, int]) -> int:
        """
        Calculate the match score between a coach and a set of language
        proficiencies.

        The score is determined based on the single language that has the best
        match (minimum score of 0).

        The formula used is:
            30 - 2 * <coach proficiency> * <other proficiency>
        where the proficiencies are assumed to be small integers with lower
        numbers corresponding to higher proficiency.

        This means the range of scores given is 0-29.

        Example:
            Coach has english:1,spanish:2,french:4
            Other has english:5,spanish:3,french:3
            Language compatibility scores are english:20,spanish:18,french:6
            Overall score is 20 (for English).
        """
        match_langs = [L for L in languages if L in c.languages]
        return max((0, *[30 - 2 * languages[L] * c.languages[L] for L in match_langs]))

    coach_matches = []
    for coach in get_coaches():
        if not coach.available:
            continue
        match_score = 0
        match_score += get_lang_match_score(coach, data.get("languages", []))
        if data.get("need") in coach.need:
            match_score += 20
        if data.get("rights") in coach.rights:
            match_score += 10
        if data.get("housing") in coach.housing:
            match_score += 10
        if data.get("gender") == coach.gender:
            match_score += 5
        if "birth_year" in data:
            match_score += max(0, 5 - abs(data["birth_year"] - coach.birth_year) // 2)
        coach_matches.append((match_score, coach))

    return sorted(coach_matches, reverse=True)


# ------------------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------------------


COMMON_HEADERS = {"Access-Control-Allow-Origin": "http://localhost:3000"}


@app.route("/")
async def index(request: sanic.request.Request) -> sanic.response.HTTPResponse:
    return await sanic.response.file("build/index.html")


@app.route("/api/v1/coaches", methods=["GET", "POST", "OPTIONS"])
@app.route("/api/v1/coaches/<coach_id:int>", methods=["GET", "POST", "DELETE"])
async def api_coaches(
    request: sanic.request.Request, coach_id: Optional[int] = None
) -> sanic.response.HTTPResponse:
    """HTTP API for 'coaches'."""
    headers = COMMON_HEADERS

    try:
        if request.method == "GET":
            if coach_id is None:
                coaches = get_coaches()
                response = sanic.response.json([c.to_json() for c in coaches])
            else:
                coach = get_coach(coach_id)
                response = sanic.response.json(coach.to_json())
        elif request.method == "POST":
            if coach_id is None:
                coach = create_coach(request.json)
            else:
                coach = edit_coach(coach_id, request.json)
            response = sanic.response.json(coach.to_json())
        elif request.method == "DELETE":
            delete_coach(coach_id)
            response = sanic.response.empty()
        elif request.method == "OPTIONS":
            headers = headers.copy()
            headers.update({
                "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            })
            response = sanic.response.empty()
        else:
            assert False
    except Exception:
        logger.exception(
            "Unexpected exception on %s route", request.path, exc_info=True
        )
        response = sanic.response.text("Error processing request", status=400)

    response.headers = sanic.response.Header(headers)
    return response


@app.route("/api/v1/coach-matches", methods=["GET"])
async def api_coach_matches(
    request: sanic.request.Request,
) -> sanic.response.HTTPResponse:
    """HTTP API for 'coach-matches'."""
    try:
        args = {k: v[0] for k, v in request.args.items()}
        for int_arg in ["birth_year", "need", "rights", "housing"]:
            if int_arg in args:
                args[int_arg] = int(args[int_arg])
        if "languages" in args:
            args["languages"] = _parse_languages(args["languages"])
        coach_matches = get_coach_matches(args)
        response = sanic.response.json(
            [
                {**coach.to_json(), "match_score": score}
                for score, coach in coach_matches
            ]
        )
    except Exception:
        logger.exception(
            "Unexpected exception on %s route", request.path, exc_info=True
        )
        response = sanic.response.text("Error processing request", status=400)

    response.headers = sanic.response.Header(COMMON_HEADERS)
    return response


# ------------------------------------------------------------------------------
# Main
# ------------------------------------------------------------------------------


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dev", action="store_true", help="Run in developer mode")
    parser.add_argument("--debug", action="store_true", help="Turn on debug logging")
    return parser.parse_args(argv)


def main(argv: List[str]):
    global coach_db

    args = parse_args(argv)

    logging.basicConfig(level=logging.DEBUG if args.debug else logging.INFO)

    coach_db = CoachDB(COACH_DB_FILE)

    if args.dev:
        port = 8000
    else:
        port = 80
    app.run(host="0.0.0.0", port=port)


if __name__ == "__main__":
    main(sys.argv[1:])
