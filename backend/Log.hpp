#pragma once

#include <string>
#include <fstream>

using namespace std;

extern string g_logFilename;

void Log(const char* message);
void Log(string message);
void Log(signed int message);
void Log(unsigned int message);