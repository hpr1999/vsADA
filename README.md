# vsada README

A small extension to build ADA files using GNAT and then run them. Windows only at the moment.

## Features

Adds commands to use gnatmake, gnatclean and to run the exe generated by gnatmake. Search for >vsada.
Also adds a command to choose the binary folder of your GNAT installation.

## Requirements

An installation of GNAT. (<https://www.gnu.org/software/gnat/>)
Specifically, gnatmake.exe, gnatclean.exe are used.
You have to set the path to the binary folder in settings or use the vsada command.

## Extension Settings


This extension contributes the following settings:

* `vsada.GNAT-bin-path`: Set the path to your GNAT binaries.

## Known Issues

Only Windows.
