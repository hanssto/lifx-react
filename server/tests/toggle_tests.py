from unittest import TestCase

import mock

from lifx_flask import app
from lifx_flask.datastore import lightData


@mock.patch.dict(lightData, clear=True, values={
    "someLight" : {
        "id": "someLight",
        "power": "off",
        "label": "someLabel"
    },
    "someOtherLight" : {
        "id": "someOtherLight",
        "power": "off",
        "label": "someOtherLabel"
    },
})
class ToggleTests(TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.base_url = "lights/%s/toggle"

    def test_unsupported_method_raises_foo(self):

        res = self.app.get(self.base_url % "id:someLight")
        self.assertEqual(res.status_code, 405)
        self.assertIn("method is not allowed", res.data)

    def test_invalid_selector_raises_400(self):

        res = self.app.post(self.base_url % "foo")
        self.assertEqual(res.status_code, 400)
        self.assertIn("Invalid", res.data)

    def test_unsupported_selector_raises_501(self):

        res = self.app.post(self.base_url % "location:bar")
        self.assertEqual(res.status_code, 501)
        self.assertIn("not implemented", res.data)

    def test_nonexistent_light_raises_404(self):

        res = self.app.post(self.base_url % "id:noLight")
        self.assertEqual(res.status_code, 404)
        self.assertIn("No light", res.data)

    def test_existing_light_power_toggled_200(self):

        self.assertEqual(lightData["someLight"]["power"], "off")

        res = self.app.post(self.base_url % "id:someLight")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(lightData["someLight"]["power"], "on")
        self.assertEqual(lightData["someOtherLight"]["power"], "off")

        res = self.app.post(self.base_url % "id:someLight")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(lightData["someLight"]["power"], "off")

