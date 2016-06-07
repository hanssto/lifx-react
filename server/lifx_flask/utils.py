"""
Various utility functions and variables.
"""

from flask import json
from werkzeug.exceptions import NotFound 

from .datastore import lightData


default_headers = {
    "Content-Type": "application/json",
}


def to_json_response(data, code=200, headers=default_headers):
    """
    Return a flask response tuple with JSONified `data`.
    """

    response = {"results": data}
    return json.dumps(response), code, default_headers


def get_light_or_404(light_id):
    """
    Get the light with `light_id` or raise a NotFound exception.

    A bit of Djangoism, but luckily not Jingoism.
    """

    if not light_id in lightData:
        raise NotFound("No light with id %s" % light_id)

    return lightData[light_id]

