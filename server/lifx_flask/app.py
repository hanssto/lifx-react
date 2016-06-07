
from flask import Flask

from . import views


app = Flask(__name__)

app.add_url_rule("/lights/<string:selector>",
                 "lights",
                 views.lights,)
app.add_url_rule("/lights/<string:selector>/toggle",
                 "toggle",
                 views.toggle,
                 methods=["POST"])
app.add_url_rule("/lights/<string:selector>/state",
                 "state",
                 views.state,
                 methods=["PUT"])

if __name__ == "__main__":
    app.run()
