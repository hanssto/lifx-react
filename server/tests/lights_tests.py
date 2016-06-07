from unittest import TestCase

from flask import json

from lifx_flask import app


class LightsTestCase(TestCase):
    """
    Tests for the /lights end point.
    """

    def setUp(self):
        self.base_url = "/lights/%s"
        self.app = app.test_client()

    def test_invalid_selector_raises_400(self):

        res = self.app.get(self.base_url % "foo")
        self.assertEqual(res.status_code, 400)
        self.assertIn("Invalid", res.data)

    def test_unsupported_selector_raises_501(self):

        res = self.app.get(self.base_url % "location:bar")
        self.assertEqual(res.status_code, 501)
        self.assertIn("Unsupported", res.data)

    def test_all_selector_json_data_returned(self):

        res = self.app.get(self.base_url % "all")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
