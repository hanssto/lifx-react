# coding: utf-8
# I remembered this time. ;-)

import json

from werkzeug.exceptions import NotImplemented

from .datastore import lightData
from .validators import (
    validate_selector,
    validate_state,
)
from .utils import default_headers, to_json_response


def lights(selector):
    """
    Gets lights belonging to the authenticated account.

    Filter the lights using selectors. Properties such as id, label, group and
    location can be used in selectors. Most endpoints accept selectors when
    performing actions.

    Parameters:
        selector: string
            The selector to limit which light information is returned.
            Required.
    """

    prop, _value = validate_selector(selector)

    if prop != "all":
        raise NotImplemented("Unsupported selector %s" % selector)

    return json.dumps(lightData.values()), 


def toggle(selector):
    """
    Turn off lights if any of them are on, or turn them on if they are all off.

    All lights matched by the selector will share the same power state after
    this action. Physically powered off lights are ignored.

    Parameters:
        selector: string
            The selector to limit which lights are toggled.
            Required.

    Data:
        duration: string
            The time is seconds to spend perfoming the power toggle.
    """

    prop, value = validate_selector(selector)

    if prop != "id":
        raise exceptions.NotImplemented(
            "Selector type %s not implemented" % prop)

    light = get_light_or_404(prop)

    power = light["power"]
    light["power"] = "off" if power == "on" else "on" 

    response_data = {
        "id": light.id,
        "label": light.label,
        "status": "ok", 
    }

    return to_json_response(response_data), default_headers


def state(selector):
    """
    Sets the state of the lights within the selector.

    All parameters (except for the selector) are optional. If you don't supply
    a parameter, the API will leave that value untouched.

    Parameters:
        selector: string
            The selector to limit which lights are controlled.
            Required.

    Data:
        power:	string
            The power state you want to set on the selector. on or off
        color:	string
            The color to set the light to.
        brightness:	double
            The brightness level from 0.0 to 1.0. Overrides any brightness set
            in color (if any).
        duration:	double
            How long in seconds you want the power action to take. Range: 0.0 –
            3155760000.0 (100 years)
    """

    prop, value = validate_selector(selector)

    if prop != "id":
        raise exceptions.NotImplemented(
            "Selector type %s not implemented" % prop)

    state = request.get_json(force=True)
    cleaned_state = validate_state(state)

    light = get_light_or_404(prop)

    for field in cleaned_state:
        light[field] = cleaned_state[field]

    response_data = {
        "id": light.id,
        "label": light.label,
        "status": "ok", 
    }

    return to_json_response(response_data)

