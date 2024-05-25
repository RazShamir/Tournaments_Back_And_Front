# Todos



## Step 1

- Basic abilities for site staff(delete user, manually add new users, create organizations, etc..)

## Tournamenets

- User signup tournament 2 
- Tournament creation 1 -> 4 subpages, details -> publicly available, 3 administrative pages -> edit, manangement(start,stop),staff
- Notes views
- Add update functions to all the serializers.
- Admin functions(edit pairing, score, shuffle, override)
- Connect the Tournaments and the Participents models.
- Check in - Optional
- Pairing system
- Score system
- Chat
- tournament logo model for tournament type

### User story

User clicks the sign in button -> updates tournament db to add to user list

On tournament start, the following should occur
1. Create a new table of the pairings(logic for calculating pairings should already exist.)
2. Create a score table
3. User state table

In a game, users click on the score buttons(win,loss,tie) and have the option to call an admin if needed. this in turn sends a notification to the dashboard of the admins.

after the match is over. the admin needs to end the round for the score to be calculated.

## SPRINT

- Look around github and different websites, take screenshots of interesting things that could assist in the project, or find similar project

- users:
    

### Pages

- Starting page, subpages for editing. administrating(start stop)


### Registration
- Fix register to check if user already exists to prevent duplicates.

- User registration function that will add the user to the participents
- Function for getting all registered users
- update functions for check in, unregister?

# Start tournament
- Split the player pool into pairings
- Delete players with check_in false
- Open administration tools
- Open standings
- Timer 

### personal tasks
- simiulate a tournament and take screen shots of the tables and how the scoring works
- how to handle extreeme situations with minimum player amounts during turnament & with bye
- razshamir13@gmail.com password: raz1234!!
- ron@gmail.com, Nadav500$
- hadar34@gmail.com hadar1234!! hadarshamir
- aviel 12345678$
- jonjon 87654321Aa
- hagai jf805395d98e!!
- TopSecret 48693737jh
- Majumbo fjei84ifkd9!!!
- Dew 57294576fkf!?
- guy ddjf74f83444!
- DorDarz dkfuf759fkd$$
- David djdue845ikdue!#
- Dingo ie745983275984873!!
- Kfir idjd749rkd8d!!
- Nachmias dif84uf8fwofo8!#
- Nelson 848uf759dk!!
- Idan 573968ekfd##
- Itay dud85093id!!
- ValeriaJB 123456789AA!

- send single tournament info (details, schedual, pairings, standings)
- get_tournaments and get tournament need to return if user is participant in any       presented tournament (boolian) (check authoraization)



###


Register & Login
Tournament registration & un-registration
Tournaments overview
Creating tournaments
Creating organizations
Participant check in

## Goals
Run a tournament

## Tokens

username: hu
guy: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjk2MTc
wMjU0LCJpYXQiOjE2OTU1NjU0NTQsImp0aSI6IjI3OWM1MWI3M2M5ODQ1OWY5M2I4NzI4NmU5ZWYwNzkzIiwidXNlcl9pZCI6Mn0.vV-0SAlpGwY9g-RERKVqt4SAAHhXu6ynPHteJBlIcrY

raz:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjk2MTcyNTEzLCJpYXQiOjE2OTU1Njc3MTMsImp0aSI6IjgxYWE4MTY2MzA4ZDQ0NGU4MWM1NzAyZjY1NzQyZmI0IiwidXNlcl9pZCI6Mn0
.wEjQRp_AIOeyxjVY5iEc2FdhOcRFO_22AbM-HQlNTLI

yoav:
username: wa

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjk2MTcyNDIyLCJpYXQiOjE2OTU1Njc2MjIsImp0aSI6IjQwY2Y4MzQ0M2M3NzRlMGRhODQ4ZjZmNDEwZmIzNjQwIiwidXNlcl9pZCI6MX0
.xNFuo31xm44JLN5hHyckRyvRZo6WJZ0on_CkM6Vp7cc

check duplicate in-game names to prevent dupes
