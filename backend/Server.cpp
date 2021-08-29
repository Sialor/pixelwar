#include "Server.hpp"

#include <iostream>

#include "CheckTimer.hpp"
#include "Split.hpp"

extern char** g_map;

extern unsigned int g_width, g_height;

extern unsigned char 	g_q_clr;
extern unsigned int 	g_q_x, g_q_y;

void ReceivePixel(string ip)
{
	// ip v4 одним числом
	unsigned int ip4 = 0;

	ip = ip == "::1" ? "127.0.0.1" : ip;

	// поиск строки с ip
	// парс ip из строки
	// split строку через точку
	vector<string> bytes = Split(ip, ".");

	unsigned int octet = 3;

	// каждую часть переводим в число
	// у числа сдвигаем биты
	// складываем части
	for (string item : bytes)
		ip4 += (unsigned int)(atoi(item.c_str()) << (octet-- * 8));

	// Log("ip: " + ip);
	// Log(ip4);

	if (TimeIsOver(ip4))
	{
		// Log("SetPixel");
		g_map[g_q_y][g_q_x] = g_q_clr;

		cout << "Content-type: text/plain\r\n" // text/html
			"\r\n"
			"" << "ok";
	}
	else
	{
		cout << "Content-type: text/plain\r\n" // text/html
			"\r\n"
			"" << "err";
	}
}

void SendMapSize()
{
	cout << "Content-type: text/plain\r\n"
		"\r\n"
		"" << g_width << ' ' << g_height << "\n";
}

void SendPieceOfCanvas(unsigned int x, unsigned int y, unsigned int width, unsigned int height)
{
	string out = "";

	if (width < 0 || height < 0 || width >= g_width || height >= g_height)
	{
		cout << "Content-type: application/octet-stream\r\n"
				"\r\n"
				"\n";
		
		return;
	}

	for (int i(y); i < y + height; ++i)
		for (int j(x); j < x + width; ++j)
			if (y >= 0 && y < g_height && x >= 0 && x < g_width)
				out += g_map[i][j];

	cout << "Content-type: application/octet-stream\r\n"
		"\r\n"
		"" << out << "\n";
}