#include "CheckTimer.hpp"

#include <algorithm>
#include <vector>
#include <ctime>

#include "Log.hpp"

using namespace std;

vector<Client> g_clients;

unsigned int requiredIp = 0;
bool isFinded = false;

bool FindIp(Client i)
{
	isFinded = i.m_ip == requiredIp;
	return isFinded;
}

bool TimeIsOver(unsigned int ip)
{
	requiredIp = ip;

	vector<Client>::iterator it = find_if(g_clients.begin(), g_clients.end(), FindIp);

	// Log(requiredIp);

	if (!isFinded)
	{
		// Log("not found");
		g_clients.push_back(Client(ip));
		it = g_clients.end();
		return true;
	}

	// Log((int)(time(NULL) - it->m_lastAction));
	// Log((int)(time(NULL)));
	// Log((int)(it->m_lastAction));

	if ((time(NULL) - it->m_lastAction) >= 10)
	{
		it->m_lastAction = time(NULL);
		return true;
	}

	return false;
}

void ClearOfLong()
{
	for (int i(0); i < g_clients.size(); ++i)
	{
		if (time(NULL) - g_clients[i].m_lastAction >= 120)
			g_clients.erase(g_clients.begin() + i);
	}
}



Client::Client(unsigned int ip) : m_ip(ip), m_lastAction(time(NULL))
{}