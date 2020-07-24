import sanic
import functools

app = sanic.Sanic("hello_example")

app.static('/', 'build/')

def check_request_for_authorization_status(request):
    sanic.log.logger.info(f"Checking authorization: IP is {request.ip}")
    match = (request.ip == "127.0.0.1")
    sanic.log.logger.info(f"Check IP matches 127.0.0.1: {match}")

    return match

def authorized(f):
    @functools.wraps(f)
    async def decorated_function(request, *args, **kwargs):
        is_authorized = check_request_for_authorization_status(request)

        if is_authorized:
            # Run the handler method and return the response.
            response = await f(request, *args, **kwargs)
            return response
        else:
            # The user is not authorized, so respond with 403.
            return sanic.response.json({'status': 'not_authorized'}, 403)

    return decorated_function

@app.route("/")
@authorized
async def index(request):
  return await sanic.response.file("build/index.html")

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=8000)