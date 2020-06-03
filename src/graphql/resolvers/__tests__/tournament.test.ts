import { DocumentType } from '@typegoose/typegoose';
import { Tournament, TournamentModel } from '@models/tournament';
import { Event, EventModel } from '@models/event';
import { Game, GameModel } from '@models/game';
import { Player, PlayerModel } from '@models/player';
import {
  generateEvent,
  generateGame,
  generatePlayer,
  generateTournament,
} from '@graphql/resolvers/test/generate';
import { ObjectId } from 'mongodb';
import { gql, gqlCall } from '../test/helper';
import { every, some } from 'lodash';

describe('Tournament GraphQL Resolver Test', () => {
  let tournaments: Array<DocumentType<Tournament>>;
  let events: Array<DocumentType<Event>>;
  let games: Array<DocumentType<Game>>;
  let players: Array<DocumentType<Player>>;

  beforeEach(async () => {
    games = await GameModel.create(
      Array.from({ length: 2 }, () => generateGame()),
    );

    players = await PlayerModel.create(
      Array.from({ length: 8 }, () => generatePlayer()),
    );

    events = await EventModel.create(
      Array.from({ length: 2 }, () => generateEvent(new ObjectId())),
    );

    tournaments = await TournamentModel.create([
      generateTournament(
        events[0]._id,
        [games[0]._id],
        players.map((p) => p._id),
        false,
      ),
      generateTournament(
        events[1]._id,
        [games[1]._id],
        players.map((p) => p._id),
        false,
      ),
    ] as Array<Tournament>);
  });

  it('should return all tournaments', async () => {
    const source = gql`
      # Write your query or mutation here
      query QueryTournaments {
        tournaments {
          _id
          name
          date_start
          date_end
          type
          event_id
          game_ids
          player_ids
          is_team_based
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournaments).toHaveLength(tournaments.length);

    expect(
      every(
        output.data?.tournaments,
        (e) =>
          some(tournaments, (s) => s.id === e._id) &&
          some(tournaments, (s) => s.name === e.name) &&
          some(tournaments, (s) => s.type === e.type) &&
          some(tournaments, (s) => s.event?.toString() === e.event_id) &&
          some(
            tournaments,
            (s) => s.date_start.toISOString() === e.date_start,
          ) &&
          some(
            tournaments,
            (s) => (s.date_end?.toISOString() ?? null) === e.date_end,
          ) &&
          some(
            tournaments,
            (s) => (s.is_team_based ?? null) === e.is_team_based,
          ) &&
          e.game_ids.length > 0 &&
          e.player_ids.length >= 0,
      ),
    ).toBe(true);
  });

  it('should return a single tournament by id', async () => {
    const source = gql`
      query QueryTournaments($id: ObjectId!) {
        tournament(id: $id) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      id: tournaments[1].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament).toBeDefined();
    expect(output.data?.tournament._id).toBe(tournaments[1].id);
    expect(output.data?.tournament.name).toBe(tournaments[1].name);
  });

  it('should return null if tournament by id not found', async () => {
    const source = gql`
      query QueryTournaments($id: ObjectId!) {
        tournament(id: $id) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      id: new ObjectId().toHexString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.tournament).toBeNull();
  });

  it.todo('should populate event for a given tournament');

  it.todo('should populate games for a given tournament');

  it.todo('should return empty array of games if no games in a tournament');

  it.todo('should populate players for a given tournament');

  it.todo('should return empty array of players if no players in a tournament');

  it.todo('should sort tournaments by name asc');

  it.todo('should sort tournaments by name desc');

  it.todo('should sort tournaments by date start asc');

  it.todo('should sort tournaments by date start desc');

  it.todo('should sort tournaments by date end asc');

  it.todo('should sort tournaments by date end desc');

  it.todo('should sort tournaments by event id');

  it.todo('should sort tournaments by id');

  it.todo('should search tournaments by their name');

  it.todo('should empty array if tournaments not found by name');

  it.todo('should get tournaments by list of ids');

  it.todo('should empty array if tournaments not found for a list of ids');

  it.todo('should return tournaments between 2 start dates');

  it.todo('should return tournaments between 2 end dates');

  it.todo(
    'should return empty array if no tournaments found between start dates',
  );

  it.todo(
    'should return empty array if no tournaments found between end dates',
  );

  it.todo('should return tournaments greater than a start date');

  it.todo('should return tournaments greater than a end date');

  it.todo('should return tournaments less than a start date');

  it.todo('should return tournaments less than a end date');

  it.todo(
    'should return empty array if no tournaments found greater than a start date',
  );

  it.todo(
    'should return empty array if no tournaments found greater than a end date',
  );

  it.todo(
    'should return empty array if no tournaments found less than a start date',
  );

  it.todo(
    'should return empty array if no tournaments found less than a end date',
  );

  it.todo('should return tournaments for a given event');

  it.todo('should return empty array if event not found');

  it.todo('should return tournaments for a given game');

  it.todo('should return empty array if game not found');

  it.todo('should return tournaments for a given player');

  it.todo('should return empty array if player not found');

  it.todo('should return tournaments for a given tournament type');

  it.todo('should return empty array if no tournaments for a tournament type');
});
