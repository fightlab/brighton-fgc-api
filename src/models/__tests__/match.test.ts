import { Types } from 'mongoose';
import { default as moment } from 'moment';
import { Match, IMatch } from '@models/match';
import { Player, IPlayer } from '@models/player';
import { Tournament, ITournament, TOURNAMENT_TYPE } from '@models/tournament';

describe('Match model test', () => {
  let tournaments: Array<Tournament>;
  let players: Array<Player>;

  let matchFull: IMatch;
  let matchMin: IMatch;
  let matchTeam: IMatch;
  let match: Match;

  beforeEach(async () => {
    // fake some tournaments
    tournaments = await Tournament.create([
      {
        name: 'Tournament #1',
        date_start: moment.utc().subtract(1, 'd').toDate(),
        date_end: moment.utc().subtract(1, 'd').add(4, 'h').toDate(),
        event: new Types.ObjectId(),
        games: [new Types.ObjectId()],
        type: TOURNAMENT_TYPE.DOUBLE_ELIMINATION,
        is_team_based: false,
        players: [new Types.ObjectId()],
      },
      {
        name: 'Tournament #2',
        date_start: moment.utc().add(1, 'd').toDate(),
        event: new Types.ObjectId(),
        games: [new Types.ObjectId()],
        type: TOURNAMENT_TYPE.ROUND_ROBIN,
        is_team_based: true,
      },
    ] as Array<ITournament>);

    // fake some players
    players = await Player.create([
      {
        handle: 'Player 0',
      },
      {
        handle: 'Player 1',
      },
      {
        handle: 'Player 2',
      },
      {
        handle: 'Player 3',
      },
    ] as Array<IPlayer>);

    matchFull = {
      tournament: tournaments[0]._id,
      loser: [players[0]._id],
      winner: [players[1]._id],
      player1: [players[0]._id],
      player2: [players[1]._id],
      round: 1,
      round_name: 'Winners Round 1',
      score1: 0,
      score2: 1,
    };

    // not sure you'd do this, but an active tournament might have blank matches
    matchMin = {
      tournament: tournaments[1]._id,
    };

    // support teams!
    matchTeam = {
      tournament: tournaments[0]._id,
      loser: [players[0]._id, players[1]._id],
      winner: [players[2]._id, players[3]._id],
      player1: [players[0]._id, players[1]._id],
      player2: [players[2]._id, players[3]._id],
    };

    // generate match to test populate
    [match] = await Match.create([matchFull] as Array<IMatch>);
  });

  it('should create & save a match successfully', async () => {
    const input = new Match(matchFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.tournament.toString()).toBe(matchFull.tournament.toString());
    expect(output.tournament.toString()).toBe(tournaments[0].id);
    expect(output.loser).toHaveLength(1);
    expect(output.loser?.[0].toString()).toBe(matchFull.loser?.[0].toString());
    expect(output.loser?.[0].toString()).toBe(players[0].id);
    expect(output.winner).toHaveLength(1);
    expect(output.winner?.[0].toString()).toBe(
      matchFull.winner?.[0].toString(),
    );
    expect(output.winner?.[0].toString()).toBe(players[1].id);
    expect(output.player1).toHaveLength(1);
    expect(output.player1?.[0].toString()).toBe(
      matchFull.player1?.[0].toString(),
    );
    expect(output.player1?.[0].toString()).toBe(players[0].id);
    expect(output.player1).toHaveLength(1);
    expect(output.player1?.[0].toString()).toBe(
      matchFull.player1?.[0].toString(),
    );
    expect(output.player1?.[0].toString()).toBe(players[0].id);
    expect(output.player2).toHaveLength(1);
    expect(output.player2?.[0].toString()).toBe(
      matchFull.player2?.[0].toString(),
    );
    expect(output.player2?.[0].toString()).toBe(players[1].id);
    expect(output.round).toBe(matchFull.round);
    expect(output.round_name).toBe(matchFull.round_name);
    expect(output.score1).toBe(matchFull.score1);
    expect(output.score2).toBe(matchFull.score2);

    // shouldn't populate virtuals
    expect(output._tournament).toBeUndefined();
    expect(output._loser).toBeUndefined();
    expect(output._winner).toBeUndefined();
    expect(output._player1).toBeUndefined();
    expect(output._player2).toBeUndefined();
  });

  it('should create & save min match successfully', async () => {
    const input = new Match(matchMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.tournament.toString()).toBe(matchMin.tournament.toString());
    expect(output.tournament.toString()).toBe(tournaments[1].id);
    expect(output.loser).toHaveLength(0);
    expect(output.winner).toHaveLength(0);
    expect(output.player1).toHaveLength(0);
    expect(output.player2).toHaveLength(0);
    expect(output.round).toBeUndefined();
    expect(output.round_name).toBeUndefined();
    expect(output.score1).toBeUndefined();
    expect(output.score2).toBeUndefined();

    // shouldn't populate virtuals
    expect(output._tournament).toBeUndefined();
    expect(output._loser).toBeUndefined();
    expect(output._winner).toBeUndefined();
    expect(output._player1).toBeUndefined();
    expect(output._player2).toBeUndefined();
  });

  it('should create & save a team match successfully', async () => {
    const input = new Match(matchTeam);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.tournament.toString()).toBe(matchTeam.tournament.toString());
    expect(output.tournament.toString()).toBe(tournaments[0].id);

    expect(output.loser).toHaveLength(2);
    expect(output.loser?.[0].toString()).toBe(matchTeam.loser?.[0].toString());
    expect(output.loser?.[1].toString()).toBe(matchTeam.loser?.[1].toString());
    expect(output.loser?.[0].toString()).toBe(players[0].id);
    expect(output.loser?.[1].toString()).toBe(players[1].id);

    expect(output.winner).toHaveLength(2);
    expect(output.winner?.[0].toString()).toBe(
      matchTeam.winner?.[0].toString(),
    );
    expect(output.winner?.[1].toString()).toBe(
      matchTeam.winner?.[1].toString(),
    );
    expect(output.winner?.[0].toString()).toBe(players[2].id);
    expect(output.winner?.[1].toString()).toBe(players[3].id);

    expect(output.player1).toHaveLength(2);
    expect(output.player1?.[0].toString()).toBe(
      matchTeam.player1?.[0].toString(),
    );
    expect(output.player1?.[1].toString()).toBe(
      matchTeam.player1?.[1].toString(),
    );
    expect(output.player1?.[0].toString()).toBe(players[0].id);
    expect(output.player1?.[1].toString()).toBe(players[1].id);

    expect(output.player2).toHaveLength(2);
    expect(output.player2?.[0].toString()).toBe(
      matchTeam.player2?.[0].toString(),
    );
    expect(output.player2?.[1].toString()).toBe(
      matchTeam.player2?.[1].toString(),
    );
    expect(output.player2?.[0].toString()).toBe(players[2].id);
    expect(output.player2?.[1].toString()).toBe(players[3].id);

    expect(output.round).toBeUndefined();
    expect(output.round_name).toBeUndefined();
    expect(output.score1).toBeUndefined();
    expect(output.score2).toBeUndefined();

    // shouldn't populate virtuals
    expect(output._tournament).toBeUndefined();
    expect(output._loser).toBeUndefined();
    expect(output._winner).toBeUndefined();
    expect(output._player1).toBeUndefined();
    expect(output._player2).toBeUndefined();
  });

  it('should populate tournament', async () => {
    const output = await Match.findById(match.id).populate('_tournament');
    expect(output?._tournament).toBeDefined();
    expect(output?._tournament?.id).toBe(tournaments[0].id);

    expect(output?._loser).toBeUndefined();
    expect(output?._winner).toBeUndefined();
    expect(output?._player1).toBeUndefined();
    expect(output?._player2).toBeUndefined();
  });

  it('should populate loser', async () => {
    const output = await Match.findById(match.id).populate('_loser');
    expect(output?._loser).toBeDefined();
    expect(output?._loser).toHaveLength(1);
    expect(output?._loser?.[0].id).toBe(players[0].id);

    expect(output?._tournament).toBeUndefined();
    expect(output?._winner).toBeUndefined();
    expect(output?._player1).toBeUndefined();
    expect(output?._player2).toBeUndefined();
  });

  it('should populate winner', async () => {
    const output = await Match.findById(match.id).populate('_winner');
    expect(output?._winner).toBeDefined();
    expect(output?._winner).toHaveLength(1);
    expect(output?._winner?.[0].id).toBe(players[1].id);

    expect(output?._tournament).toBeUndefined();
    expect(output?._loser).toBeUndefined();
    expect(output?._player1).toBeUndefined();
    expect(output?._player2).toBeUndefined();
  });

  it('should populate player 1', async () => {
    const output = await Match.findById(match.id).populate('_player1');
    expect(output?._player1).toBeDefined();
    expect(output?._player1).toHaveLength(1);
    expect(output?._player1?.[0].id).toBe(players[0].id);

    expect(output?._tournament).toBeUndefined();
    expect(output?._winner).toBeUndefined();
    expect(output?._loser).toBeUndefined();
    expect(output?._player2).toBeUndefined();
  });

  it('should populate player 2', async () => {
    const output = await Match.findById(match.id).populate('_player2');
    expect(output?._player2).toBeDefined();
    expect(output?._player2).toHaveLength(1);
    expect(output?._player2?.[0].id).toBe(players[1].id);

    expect(output?._tournament).toBeUndefined();
    expect(output?._winner).toBeUndefined();
    expect(output?._player1).toBeUndefined();
    expect(output?._loser).toBeUndefined();
  });

  it('should populate all fields', async () => {
    const output = await Match.findById(match.id)
      .populate('_tournament')
      .populate('_loser')
      .populate('_winner')
      .populate('_player1')
      .populate('_player2');

    expect(output?._tournament).toBeDefined();
    expect(output?._tournament?.id).toBe(tournaments[0].id);

    expect(output?._loser).toBeDefined();
    expect(output?._loser).toHaveLength(1);
    expect(output?._loser?.[0].id).toBe(players[0].id);

    expect(output?._winner).toBeDefined();
    expect(output?._winner).toHaveLength(1);
    expect(output?._winner?.[0].id).toBe(players[1].id);

    expect(output?._player1).toBeDefined();
    expect(output?._player1).toHaveLength(1);
    expect(output?._player1?.[0].id).toBe(players[0].id);

    expect(output?._player2).toBeDefined();
    expect(output?._player2).toHaveLength(1);
    expect(output?._player2?.[0].id).toBe(players[1].id);
  });
});
