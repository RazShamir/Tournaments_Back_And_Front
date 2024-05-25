

# will be good to handle:
- when a match result is submitted during a round, the match table moves
    (moves to lowest number, always above the BYE table
    (might be organized by player stats in real time instead of being static))
- if there is a "conflict" result in match - send notification to admin(s) to let them know



- add to tournament settings if tournament has check-in or not
- design a "general" info window in details page
- create admin limitations on certain pages and actions
- player opponent page history + stats
- pairings might not work as intended (example: testtest1, round 3 - why is hadarshamir not VS topsecrete when they have the same score.
    if repaired correctly, it would not cause any conflict like pairing 2 players that already had a match.
    only possible problem would be that jonjon would be severely down-paired against majumbo)
- 
- 
- DELETE TOURNAMENTS,USERS from DB (except a superuser)
- create tournaments (upcoming with future dates)
- create at-least 4 users

how to dump DB:
1. right click NewTournamentsDB in PostreSQL
2. click backup button
3. enter file name mydb.pgdump
4. click the backup button to create the dump
5. the file is saved to Documents folder (mydb.pgdump)
