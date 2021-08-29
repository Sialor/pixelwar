#pragma once

#include <string>

using namespace std;

void ReceivePixel(string ip);

void SendMapSize();

void SendPieceOfCanvas(unsigned int x, unsigned int y, unsigned int width, unsigned int height);