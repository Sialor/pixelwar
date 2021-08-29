#pragma once

#include <ctime>

struct Client
{
	unsigned int m_ip;
	time_t m_lastAction;

	Client(unsigned int ip);
};

bool TimeIsOver(unsigned int ip);

void ClearOfLong();