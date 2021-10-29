/**
 * @author Benjamin Guirlet
 * @description
 *      The main file of the bot.
 *      It loads and starts the bot.
 */


const { TOKEN, CLIENT_ID, GUILD_ID } = require( './files/config.json' );
const { Client, Collection, Intents } = require( 'discord.js' );
const { loadCommands, loadEvents } = require( "./utils/load_files" );
const { loadCommandsToGuild } = require( "./utils/register_commands" );


const intentsList = [
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_PRESENCES,
	Intents.FLAGS.GUILD_VOICE_STATES,
]
const client = new Client( { intents: intentsList } );

// This attribute is used to store the musics.
// The music at position 0 is the one being played.
client.queue = [];

// This attribute is used to store the ID of the current vocal channel
// where the bot is streaming music.
client.currentVocalChannelId = "";

client.commands = new Collection();
(
	async () => {
		await loadCommands( client );
		await loadEvents( client );

		//await loadCommandsToGuild( CLIENT_ID, GUILD_ID )

		await client.login( TOKEN );
	}
)();
