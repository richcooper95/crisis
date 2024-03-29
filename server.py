import json
import os
import functools
import logging
from collections import defaultdict, namedtuple
from typing import Collection, Dict, List, Optional, Tuple, Union

import flask as flask


LOCALHOST_ORIGIN = "http://localhost:3000"


# ------------------------------------------------------------------------------
# Flask app
# ------------------------------------------------------------------------------

app = flask.Flask("crisis", static_folder="build/", static_url_path="/")
logger = app.logger
#logger.setLevel(logging.DEBUG)

# In development mode, allow access from the Yarn-hosted frontend.
if os.environ.get("FLASK_ENV") == "development":
    import flask_cors

    flask_cors.CORS(app, origins=[LOCALHOST_ORIGIN])


# ------------------------------------------------------------------------------
# Database
# ------------------------------------------------------------------------------


# JSON type for coach data.
JSON = Union[str, int, float, bool, None, List["JSON"], Dict[str, "JSON"]]
CoachJSON = Dict[str, JSON]

# Flask accepted response return types.
_FlaskJSON = Dict[str, JSON]
_FlaskResponse = Union[flask.Response, str, _FlaskJSON]
_FlaskStatus = int
_FlaskHeaders = Union[List[str], Dict[str, str]]
FlaskReturn = Union[
    _FlaskResponse,
    Tuple[_FlaskResponse, _FlaskStatus],
    Tuple[_FlaskResponse, _FlaskHeaders],
    Tuple[_FlaskResponse, _FlaskStatus, _FlaskHeaders],
]


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
        bio: Optional[str] = None,
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

    def get(self, key) -> JSON:
        return getattr(self, key)


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


# The file used to persist the coach DB.
COACH_DB_FILE = "./coach_db.json"

# The in-memory database of coaches.
coach_db: CoachDB = CoachDB(COACH_DB_FILE)


# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------


def _parse_languages(languages: str) -> Dict[str, int]:
    ret = dict()
    if not languages:
        return ret

    for lang in languages.rstrip(",").split(","):
        lang_name, proficiency = lang.split(":")
        ret[lang_name] = int(proficiency)
    return ret


def _parse_experience(experience: str) -> List[int]:
    """
    Convert a string representation of a list of integers to a proper list of
    ints.
    """

    if not experience:
        return list()
    return [int(x) for x in experience.rstrip(",").split(",")]


def _get_coach_json(coach_args: JSON) -> CoachJSON:
    """
    Return a CoachJSON object corresponding the args from the get coaches
    request.
    """

    field_conversion = defaultdict(
        lambda: (lambda x: x),
        birth_year=int,
        need=_parse_experience,
        rights=_parse_experience,
        housing=_parse_experience,
        languages=_parse_languages,
    )
    return {k: field_conversion[k](v) for k, v in coach_args.items()}
    

def _coach_matches_filter(coach: CoachJSON,
                          coach_filter: CoachJSON) -> bool:
    """
    Check whether to include a coach from the db in a repsoonse by filtering on
    if the coach matches the fields in coach_filter.
    """

    # Check fields where the value is a:
    #
    #   dict: by checking if all key:value pairs of coach_filter[key] are
    #         elements of coach[key]
    #
    #   lists: by checking that every element of coach_filter[key] is an
    #          element of coach[key], i.e. by ignoring ordering
    #
    #   all others: by direct comparison
    for key, filter_val in coach_filter.items():

        if isinstance(filter_val, dict):
            if not all(item in coach.get(key).items()
                       for item in filter_val.items()):
                return False

        elif isinstance(filter_val, list):
            if not set(filter_val) <= set(coach.get(key)):
                return False

        else:
            if coach.get(key) != filter_val:
                return False
    
    # If reaching final statement, that implies all filters apply, and the
    # coach should be included.
    return True


# Using flask_cors doesn't seem to have the desired effect for the API when
# deployed on AWS Lambda, so we create our own decorator that sets the CORS
# header and apply it to the API route handlers.
def allow_cors(route_handler):
    @functools.wraps(route_handler)
    def wrapper(*args, **kwargs):
        response = route_handler(*args, **kwargs)
        response = flask.make_response(response)

        allowed_origins = os.environ.get("ALLOWED_ORIGINS",
                                         LOCALHOST_ORIGIN).split(',')

        if os.environ.get("FLASK_ENV") != "development":
            if (flask.request.headers["Origin"] in allowed_origins):
                allowed_origin = flask.request.headers["Origin"]
                logger.debug(f"Origin {allowed_origin} is allowed")
            else:
                allowed_origin = allowed_origins[0]
                logger.debug(f"Origin {flask.request.headers['Origin']} is "
                              "not allowed")
            response.headers["Access-Control-Allow-Origin"] = allowed_origin

        return response
    return wrapper


# ------------------------------------------------------------------------------
# Route handlers
# ------------------------------------------------------------------------------

def get_coaches(coach_filter: Optional[CoachJSON] = None) -> List[Coach]:
    """Return all coaches that match coach_filter."""
    return [
        coach
        for coach in coach_db
        if not coach_filter or _coach_matches_filter(coach, coach_filter)
    ]


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


@app.route("/")
def index() -> flask.Response:
    return app.send_static_file("index.html")


@app.route("/api/v1/coaches", methods=["GET", "POST"])
@allow_cors
def api_coaches() -> FlaskReturn:
    """HTTP API for 'coaches'."""
    try:
        if flask.request.method == "GET":
            args = dict(**flask.request.args)
            coach_filter = _get_coach_json(args)
            coaches = get_coaches(coach_filter)
            response = flask.jsonify([c.to_json() for c in coaches])
        elif flask.request.method == "POST":
            coach = create_coach(flask.request.json)
            response = flask.jsonify(coach.to_json())
        else:
            assert False, "Unsupported method"
    except Exception:
        logger.exception("Unexpected exception on %s route", flask.request.path)
        raise

    return response


@app.route("/api/v1/coaches/<int:coach_id>", methods=["GET", "POST", "DELETE"])
@allow_cors
def api_coaches_id(coach_id: int) -> FlaskReturn:
    """HTTP API for 'coaches' with ID given."""
    try:
        if flask.request.method == "GET":
            coach = get_coach(coach_id)
            response = flask.jsonify(coach.to_json())
        elif flask.request.method == "POST":
            coach = edit_coach(coach_id, flask.request.json)
            response = flask.jsonify(coach.to_json())
        elif flask.request.method == "DELETE":
            delete_coach(coach_id)
            response = ""
        else:
            assert False, "Unsupported method"
    except Exception:
        logger.exception("Unexpected exception on %s route", flask.request.path)
        raise

    return response


@app.route("/api/v1/coach-matches", methods=["GET", "OPTIONS"])
@allow_cors
def api_coach_matches() -> FlaskReturn:
    """HTTP API for 'coach-matches'."""
    try:
        args = dict(**flask.request.args)
        for int_arg in ["birth_year", "need", "rights", "housing"]:
            if int_arg in args:
                args[int_arg] = int(args[int_arg])
        if "languages" in args:
            args["languages"] = _parse_languages(args["languages"])
        coach_matches = get_coach_matches(args)
        response = flask.jsonify(
            [
                {**coach.to_json(), "match_score": score}
                for score, coach in coach_matches
            ]
        )
    except Exception:
        logger.exception("Unexpected exception on %s route", flask.request.path)
        raise

    return response
