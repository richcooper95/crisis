import argparse
import functools
import json
import logging
import os
import sys
from collections import namedtuple
from typing import Any, Dict, List, Optional, Union

import sanic
import sanic.request
import sanic.response

logger = logging.getLogger(__name__)

app = sanic.Sanic("hello_example")

app.static("/", "build/")


# JSON type for coach data.
CoachJSON = Dict[str, Union[str, int, bool, float, "CoachJSON"]]


class Coach(namedtuple("_Coach", ["id", "name", "birth_year", "gender"])):
    """A coach object - an entry in the database."""

    def __new__(
        cls, *, id: Optional[int] = None, name: str, birth_year: int, gender: str
    ):
        return super().__new__(
            cls, id=id, name=name, birth_year=birth_year, gender=gender
        )

    def to_json(self) -> Dict[str, Any]:
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
            File to use as persistent storage of the DB. If not found it will be created.
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
        if self._auto_persist:
            self.persist(self._file)
        return db_coach

    def remove(self, coach_id: int):
        """Remove a coach from the DB by ID."""
        try:
            self._db.pop(coach_id)
        except KeyError:
            raise KeyError(f"Coach with ID '{coach_id}' not found")
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
        if self._auto_persist:
            self.persist(self._file)
        return coach

    def persist(self, file: os.PathLike) -> None:
        data = dict(next_id=self._next_id, data=[c.to_json() for c in self])
        with open(file, "w") as f:
            json.dump(data, f)

    def _load_from_file(self, file: os.PathLike):
        try:
            with open(file, "r") as f:
                data = json.load(f)
            self._db = {c["id"]: Coach.from_json(c) for c in data["data"]}
            self._next_id = data["next_id"]
        except FileNotFoundError:
            self.persist(file)


# The in-memory database of coaches.
coach_db: CoachDB

# The file used to persist the coach DB.
COACH_DB_FILE = "./coach_db.json"


# ------------------------------------------------------------------------------
# Route handlers
# ------------------------------------------------------------------------------


async def get_coaches() -> List[Coach]:
    return list(coach_db)


async def get_coach(coach_id: int) -> Coach:
    return coach_db.get(coach_id)


async def create_coach(data: CoachJSON) -> Coach:
    coach = Coach(name=data["name"], birth_year=1995, gender="male")
    db_coach = coach_db.add(coach)
    return db_coach


async def edit_coach(coach_id: int, data: CoachJSON) -> Coach:
    updated_coach = Coach(
        id=coach_id, name=data["name"], birth_year=1995, gender="male"
    )
    db_coach = coach_db.update_entry(updated_coach)
    return db_coach


async def delete_coach(coach_id: int) -> None:
    coach_db.remove(coach_id)


async def get_coach_matches(data: CoachJSON) -> List[Coach]:
    return []


# ------------------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------------------


@app.route("/")
async def index(request: sanic.request.Request) -> sanic.response.HTTPResponse:
    return await sanic.response.file("build/index.html")


@app.route("/api/v1/coaches", methods=["GET", "POST"])
@app.route("/api/v1/coaches/<coach_id:int>", methods=["GET", "POST", "DELETE"])
async def api_coaches(
    request: sanic.request.Request, coach_id: Optional[int] = None
) -> sanic.response.HTTPResponse:
    """HTTP API for 'coaches'."""
    if request.method == "GET":
        if coach_id is None:
            coaches = await get_coaches()
            response = sanic.response.json([c.to_json() for c in coaches])
        else:
            coach = await get_coach(coach_id)
            response = sanic.response.json(coach.to_json())
    elif request.method == "POST":
        if coach_id is None:
            coach = await create_coach(request.json)
        else:
            coach = await edit_coach(coach_id, request.json)
        response = sanic.response.json(coach.to_json())
    elif request.method == "DELETE":
        await delete_coach(coach_id)
        response = sanic.response.empty()
    else:
        assert False

    return response


@app.route("/api/v1/coach-matches", methods=["GET"])
async def api_coach_matches(
    request: sanic.request.Request,
) -> sanic.response.HTTPResponse:
    """HTTP API for 'coach-matches'."""
    coaches = await get_coach_matches(request.args)
    return sanic.response.json(
        [c.to_json() for c in coaches],
        headers={"Access-Control-Allow-Origin": "http://localhost:3000"},
    )


# ------------------------------------------------------------------------------
# Main
# ------------------------------------------------------------------------------


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dev", action="store_true", help="Run in developer mode")
    return parser.parse_args(argv)


def main(argv: List[str]):
    global coach_db

    args = parse_args(argv)

    coach_db = CoachDB(COACH_DB_FILE)

    if args.dev:
        port = 8000
    else:
        port = 80
    app.run(host="0.0.0.0", port=port)


if __name__ == "__main__":
    main(sys.argv[1:])
