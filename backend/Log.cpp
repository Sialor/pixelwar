#include "Log.hpp"

#include <string>
#include <fstream>

string g_logFilename = "/var/log/nginx/index.fcgi.log";

void Log(const char* message)
{
	ofstream file(g_logFilename, ios::app);
	file << message << endl;
	file.close();	
}

void Log(string message)
{
	ofstream file(g_logFilename, ios::app);
	file << message << endl;
	file.close();
}

void Log(signed int message)
{
	ofstream file(g_logFilename, ios::app);
	file << message << endl;
	file.close();
}

void Log(unsigned int message)
{
	ofstream file(g_logFilename, ios::app);
	file << message << endl;
	file.close();
}