# coding: UTF-8

from setuptools import setup, find_packages

setup(
    name="lifx_flask",
    version="0.0.1a1",
    description=(
        "Dummy Flask implementation of the LIFX REST API. "
        "See https://api.developer.lifx.com/docs/."
    ),
    author="Hans Tømmerholt",
    author_email="hanstto@github.com",
    packages=find_packages(exclude=['tests']),
    install_requires=[
        'Flask==0.11',
    ],
)
