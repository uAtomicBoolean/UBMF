/**
 * @author Benjamin Guirlet
 * @description
 *      The main file of the bot.
 *      It loads and starts the bot.
 */


const { TOKEN } = require( "./files/config.json" );
const { Client, Collection, Intents } = require( 'discord.js' );
const { loadCommands, loadEvents } = require( "./utils/load_files" );


const intentsList = [
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_PRESENCES,
	Intents.FLAGS.GUILD_VOICE_STATES,
]
const client = new Client( { intents: intentsList } );

// This Map keeps the guilds' player, voice connection and channel's ID to allow multi-server use.
// currentSong -> Used to keep the information about the music currently played by the bot.
// Key : guild's ID
// Element : { player, connection, voiceChannelId, commandChannel, currentSong, queue }
client.guildsData = new Map();

client.commands = new Collection();
(
	async () => {
		await loadCommands( client );
		await loadEvents( client );

		// await loadCommandsToGuild( CLIENT_ID, GUILD_ID )

		await client.login( TOKEN );
	}
)();
