#include <algorithm>
#include <iostream>
#include <thread> // for save map every 30 second
#include <string>

#include <unistd.h>

#include "fcgio.h" // for cpp

#include "Map.hpp" // load/save map
#include "CheckTimer.hpp"
#include "Log.hpp"
#include "Server.hpp"

using namespace std;

unsigned int g_width = 8192;
unsigned int g_height = 4096;

// queries
string 			g_q_action = "";
unsigned char 	g_q_clr;
unsigned int 	g_q_x, g_q_y;
unsigned int 	g_q_width, g_q_height;

char **g_map = nullptr;

void ReadBuffers(FCGX_Request &request)
{
	static fcgi_streambuf cin_fcgi_streambuf;
	static fcgi_streambuf cout_fcgi_streambuf;
	static fcgi_streambuf cerr_fcgi_streambuf;

	cin_fcgi_streambuf = fcgi_streambuf(request.in);
	cout_fcgi_streambuf = fcgi_streambuf(request.out);
	cerr_fcgi_streambuf = fcgi_streambuf(request.err);

	cin.rdbuf(&cin_fcgi_streambuf);
	cout.rdbuf(&cout_fcgi_streambuf);
	cerr.rdbuf(&cerr_fcgi_streambuf);
}

void Thread()
{
	static int i = 0;
	while(1)
	{
		sleep(30);
		i++;

		// Log("Save map");
		SaveMap();

		if (i == 2)
		{
			// Log("ClearOfLong");
			ClearOfLong();
			i = 0;
		}
	}
}

int main()
{
	// Log("Start fcgi Server");

	// load map
	LoadMap();

	thread thr1(Thread);

	string key, value, query, method;

	unsigned int pos;

    FCGX_Request request;

    FCGX_Init();
    FCGX_InitRequest(&request, 0, 0);
	while(FCGX_Accept_r(&request) == 0)
	{
		ReadBuffers(request);

		query = FCGX_GetParam("QUERY_STRING", request.envp);
		method = FCGX_GetParam("REQUEST_METHOD", request.envp);

		g_q_action.clear();

		g_q_clr = 0;

		g_q_y = 0;
		g_q_x = 0;
		g_q_width = 0;
		g_q_height = 0;

		// parse queries
		while ((pos = query.find_first_of("&=")) != (unsigned int)-1)
			query[pos] = ' ';

		pos = (count(query.begin(), query.end(), ' ') + 1) / 2; // number of ' '

		for (int i(0); i < pos; ++i)
		{
			key = query.substr(0, query.find_first_of(' '));
			
			query = query.substr(key.length() + 1);
			
			value = query.substr(0, query.find_first_of(' '));
			
			query = (query.length() > value.length() + 1) ? 
				query.substr(value.length() + 1) : 
				"";

			if (key == "action")
				g_q_action = value;

			else if (key == "clr")
				g_q_clr = (unsigned char)atoi(value.c_str());

			else if (key == "x")
				g_q_x = atoi(value.c_str());

			else if (key == "y")
				g_q_y = atoi(value.c_str());

			else if (key == "width")
				g_q_width = atoi(value.c_str());

			else if (key == "height")
				g_q_height = atoi(value.c_str());
		}

		// char **param = request.envp;
		// while(*param != NULL)
		// 	Log(*(param++));

		if (g_q_action == "getmapsize")
			SendMapSize();

		else if (g_q_action == "setpixel")
			// в параметре строка с ip адресом из 4-х байт разделенных точкой
			ReceivePixel(string(*(request.envp + 13)).substr(12));

		else if (g_q_action == "getpieceofcanvas")
			SendPieceOfCanvas(g_q_x, g_q_y, g_q_width, g_q_height);
	}

	// никогда не достигнет

	return 0;
}