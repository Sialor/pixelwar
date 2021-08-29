#include "Split.hpp"

#include <vector>
#include <list>
#include <string>

vector<string> Split(string input_string, string search_string)
{
    list<int> search_hit_list;
    vector<string> word_list;
    size_t search_position, search_start = 0;

    // Find start positions of every substring occurence and store positions to a hit list.
    while ( (search_position = input_string.find(search_string, search_start) ) != string::npos) {
        search_hit_list.push_back(search_position);
        search_start = search_position + search_string.size();
    }

    // Iterate through hit list and reconstruct substring start and length positions
    int character_counter = 0;
    int start, length;

    for (auto hit_position : search_hit_list) {

        // Skip over substrings we are splitting with. This also skips over repeating substrings.
        if (character_counter == hit_position) {
            character_counter = character_counter + search_string.size();
            continue;
        }

        start = character_counter;
        character_counter = hit_position;
        length = character_counter - start;
        word_list.push_back(input_string.substr(start, length));
        character_counter = character_counter + search_string.size();
    }

    // If the search string is not found in the input string, then return the whole input_string.
    if (word_list.size() == 0) {
            word_list.push_back(input_string);
            return word_list;
    }
    // The last substring might be still be unprocessed, get it.
    if (character_counter < input_string.size()) {
        word_list.push_back(input_string.substr(character_counter, input_string.size() - character_counter));
    }

    return word_list;
}