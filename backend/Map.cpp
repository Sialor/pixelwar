#include "Map.hpp"

#include <fstream>
#include <string>

using namespace std;

string s_mapFileName = "/var/www/map";

extern unsigned int g_width;
extern unsigned int g_height;

extern char **g_map;

void LoadMap()
{
	ifstream file;
	
	file.open(s_mapFileName, ios::in | ios::binary);
	
	if (!file.is_open())
		exit(1);
	
	file.read((char*)&g_width, 4); // width в блоках
	file.read((char*)&g_height, 4); // height в блоках
	
	g_map = new char*[g_height];
	
	for (int i(0); i < g_height; ++i)
	{
		g_map[i] = new char[g_width];
		file.read(g_map[i], g_width);
	}

	file.close();
}

void SaveMap()
{
	ofstream file;
	
	file.open(s_mapFileName, ios::out | ios::binary);
	
	if (!file.is_open())
		exit(1);
	
	file.write((char*)&g_width, 4); // width в блоках
	file.write((char*)&g_height, 4); // height в блоках
	
	for (int i(0); i < g_height; ++i)
		file.write(g_map[i], g_width);

	file.close();
}