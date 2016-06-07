"""
Validators for parameters and data content.
"""

import re

from werkzeug.exceptions import BadRequest


selector_re = re.compile(r'^(?P<property>[^:]+):(?P<value>[^:]+)$') 

valid_selectors = [
    "id",
    "label",
    "group",
    "location",
]


def validate_selector(selector):

    if selector == "all":
        return "all", None

    match = selector_re.match(selector)

    if not match:
        raise BadRequest("Invalid selector %s" % selector)

    prop, value = match.group("property"), match.group("value")

    if prop not in valid_selectors:
        raise BadRequest(
            "Unsupported selector %s. Must be one of %s." % (
                prop, ", ".join(valid_selectors)))

    return prop, value 



valid_state_fields = {
    "color": int,
    "power": str,
    "brightness": float,
    "duration": float,
}


def validate_state(state):

    cleaned_values = {}

    for field in state:
        if field not in valid_state_fields:
            # TODO This should only be a warning.
            raise BadRequest("Invalid state field %s" % field)

        # This is extremely hacky...
        validator = valid_state_fields[field]
        try:
            cleaned = validator(state[field])
        except ValueError, e:
            # TODO Should store and return multiple errors.
            raise BadRequest(
                "Invalid value for %s for field %s" % (field, state[field]))

        # TODO Validate values too.

        cleaned_values[field] = cleaned

    return cleaned_values

