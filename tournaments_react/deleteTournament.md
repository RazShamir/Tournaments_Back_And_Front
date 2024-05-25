DELETE from tournaments_app_pool_participants WHERE participants_id in
(SELECT participants_id from participants WHERE tournament_id = '62fb056d-f6a0-4f27-a55a-e2c5b0ec17e1');

DELETE from statistics where participant_id in
(SELECT id from participants WHERE tournament_id = '62fb056d-f6a0-4f27-a55a-e2c5b0ec17e1');

DELETE from matches WHERE rounds_id in (SELECT id from rounds WHERE tournament_id = '62fb056d-f6a0-4f27-a55a-e2c5b0ec17e1');
DELETE from participants WHERE tournament_id = '62fb056d-f6a0-4f27-a55a-e2c5b0ec17e1';
DELETE from rounds WHERE tournament_id ='62fb056d-f6a0-4f27-a55a-e2c5b0ec17e1';
DELETE from tournaments_app_pool where tournament_id ='62fb056d-f6a0-4f27-a55a-e2c5b0ec17e1';
DELETE from tournaments_app_tournamentadmin where tournament_id ='62fb056d-f6a0-4f27-a55a-e2c5b0ec17e1';
DELETE from tournaments where id ='62fb056d-f6a0-4f27-a55a-e2c5b0ec17e1';
