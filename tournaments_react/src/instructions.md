                                            how to use the website:
Teacher user details:
    Username: Valeria
    Password: 123456789AA!

Other SuperUsers:
    -username: razshamir
     Password: raz1234!!
     Organization: CoolGamesTCG

    -username: ron
     Password: Nadav500$
     Organization: Avici
    
    -username: Majumbo
     Password: fjei84ifkd9!!!
     Organization: TopDeck


1. login/signup:
    - On the right end of the main website navbar you have user-options, if not logged in you will see a "login" and "signup" options.
        there you can properly create an account or log into an existing one.
    - when creating an account, remember your "username" and "password". Without them you cannot log back in.
2. player dashboard:
    - also in options bar. the purpose of the player dashboard is to help users manage tournaments they're registered to. it displays every relevant 
        information for every tournament you participate and gives comfortable shortcuts to relevant page in a specific tournament.

3. organization page:
    - will also be displayed in options bar, will appear as "create organization" if user is yet to create one (note, only users
        designated as "staff" have this function and only the "super-user" can give this role).
      - if user already created/joined an organization (only "organization organizer" can add a user to his organization),
        the link to Org page will be displayed with the organizations name.
      - in Org page you have two links - tournaments and staff.
      - "tournaments":
        - catalog of all tournaments created by your organization. 
        - "create tournament" button - opens a window where you create your tournament
      - "staff":
        - contains list of all organization admins. 
        - "add admin" button - opens a list of all website users, you can choose any user to add to your organization.

4. switch organization:
    - also in options bar. if user is affiliated with more than one organization this function will appear. when clicked,
        a window containing the name of every organization you affiliate with will open. the Org name you click on will switch your
        "organization button" to the appropriate organization you chose.

5. Main page:
    - catalogs every tournament in website by state.
      - "most relevant" page - shows all "upcoming" tournaments for the coming week, "completed" tournaments shows all tournaments that
        took place in the last week.
      - "upcoming" page - shows every tournament that is not ongoing and does not have an end time.
      - "completed" page - shows every tournament that has an end time. also displays tournament winner.
      - "ongoing" page - shows every currently ongoing tournaments.
    - tournaments info - in every displayed tournament you can click certain details that will lead you to the appropriate page in
      that tournament.

6. Tournament pages:
    * before tournament starts:
      - "details" - contains the description of the tournament, provided by the tournament admin(s), and some general information
          for the tournament.
      - "schedule" - gives time estimates for the tournament, based on given round timer and amount of rounds (amount of tournament
         rounds is based on the number of participants). changes as more users register to tournament before it starts.
      - "register" - leads to register page. there you enter your in-game name and sign up to the tournament. 
         after registering, you have the option to un-register from the tournament.
      - "check-in" - after registering, the "register" button will switch to "check-in". clicking the button will check you in to the
         tournament. the purpose of checking in to the tournament is to remove players registered but for some reason will not participate.
         when the tournament starts, participants who have not checked-in will be removed from the tournament.
      - "registrations" - displays all registered users. if a player has checked-in to tournament, the red "X" next to his name
        will switch to a green check-mark.
    * after tournament starts:
      - "pairings" - displays all round(s), round timer and matches. 
        - can look at previous rounds 
        - if participating in the tournament, next to your users table you will have a "view" button that will lead you to your
          match table.
        - under every participants name you can see their "match-balance" (WIN-LOSE-TIE).
      - "standings" - displays all tournament participants and their stats, ordered by "Points" (Win = 3, Lose = 0, Tie = 1).
        after every new round, standings will be updated with the last rounds stats.
    * if user is tournament admin:
      - "admin" - admin only page, there it is possible to edit multiple aspects of a tournament.

7. tournament admin pages:
   - "dashboard" - in this page you start the tournament which creates the initial round.
     - after tournament starts, the button will change to "next round", which will create every subsequent tournament round and update standings page.
     - after publishing the last round, the button will change to "end tournament", which ends the tournament and updates relevant information.
     
   - "edit tournament" - contains pages to edit certain aspects of the tournament.
     - "general":
       - "publish" button - toggles if tournament is visible in website main page.
       - "change start time" - changes the tournaments start time.
     - "description":
       - here the admin writes any information he wants about the tournament. uses "markdown" to allow personalized page visuals.
     - "phases":
       - here the admin dictates round timer. can be changed during the tournament.
     - "staff":
       - here an admin can see a list of all "organization admins" in his affiliated organization and add any of them to the
         tournament admin staff.
       
   - "edit participants" - displays a list of all registered participants. you can click to select as many participants as you wish.
     when clicking the "remove selected" button, selected participants will be removed from the tournament.
     this function only works before the start of the tournament.

8. Matches:
    - "match" pages:
      * if viewed by match participant:
        - only participants that belong to the specific match table have access to that match page.
        - in match page you can see your opponents name, stats and in-game name (when clicking the "in-game name", it will
          automatically be copied to clipboard) .
          - the round timer will also be displayed.
        - reporting match results:
          depending on the match type you will have two different displays for reporting match results
          - best of 1 - you will have only one game to report (WIN or LOSE).
          - best of 3 - you will have three games to report (WIN or LOSE). if any participant wins 2 games in a row, the third game
            report will be blocked as there is no more need to report it (in a best of 3, you need to win 2 out of the three games
            in the match. so winning twice in a row means that the third game is unnecessary)
        - if both participants reports match each other correctly, the information will be sent to the DB and match state will
          become "finished" (exmp: if player 1 reported WIN-LOSE-WIN and player 2 reported LOSE-WIN-LOSE, it is an acceptable result).
        - if reported results do not match (exmp: player 1 reported WIN-LOSE-WIN and player 2 reported WIN-LOSE-WIN), the match 
          state will be "conflict". at this state, both participants will be allowed to try and report again until DB is sent an
           appropriate match result.
        - after results are submitted, participants can no longer send another match result.
      * if viewed by tournament admin:
        - different page is displayed for admins, if admin is a participant in that match he will see the normal match page.
        - displayed in the page are the two match participants names and between them a "tie" button.
        - when clicking on any participant and clicking the "submit" button, you report that participant as the winner of that
          match (if best of 3, report will contain WIN-WIN).
        - when clicking "tie" and submitting, the match will be reported as a tie (as if each participant has won 1 game each).