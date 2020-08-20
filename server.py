import functools
import logging
from collections import namedtuple
from typing import Any, Dict, List, Optional, Union

import sanic
import sanic.request
import sanic.response

logger = logging.getLogger(__name__)

app = sanic.Sanic("hello_example")

app.static("/", "build/")


# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------


class Coach(namedtuple("_Coach", ["name"])):
    def to_json(self) -> Dict[str, Any]:
        return self._asdict()


async def get_coaches() -> List[Coach]:
    return []


async def get_coach(coach_id: int) -> Coach:
    return Coach("name")


async def create_coach(data: Dict[str, Union[str, int]]) -> int:
    return 1


async def delete_coach(coach_id: int) -> None:
    pass


# ------------------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------------------


@app.route("/")
async def index(request: sanic.request.Request) -> sanic.response.HTTPResponse:
    return await sanic.response.file("build/index.html")


@app.route("/api/v1/coaches", methods=["GET", "POST"])
@app.route("/api/v1/coaches/<coach_id:int>", methods=["GET", "DELETE"])
async def api_coaches(
    request: sanic.request.Request, coach_id: Optional[int] = None
) -> sanic.response.HTTPResponse:
    """HTTP API for 'coaches'."""
    if request.method == "GET":
        if coach_id:
            coach = await get_coach(coach_id)
            response = sanic.response.json(coach.to_json())
        else:
            coaches = await get_coaches()
            response = sanic.response.json([c.to_json() for c in coaches])
    elif request.method == "POST":
        coach_id = await create_coach(request.json)
        response = sanic.response.json({"coach-id": coach_id})
    elif request.method == "DELETE":
        # TODO: tidy up parsing of path
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
    # TODO: Implement properly :)
    print("Got request:")
    for key in ["age", "gender", "languages", "need", "rights", "housing"]:
        print(key, request.args.get(key))
    return sanic.response.json([])


# ------------------------------------------------------------------------------
# Main
# ------------------------------------------------------------------------------


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
