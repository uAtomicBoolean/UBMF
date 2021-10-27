/**
 * @author Benjamin Guirlet
 * @description
 *      The main file of the bot.
 *      It loads and starts the bot.
 */


const { TOKEN } = require( './files/config.json' );
const { Client, Collection, Intents } = require( 'discord.js' );
const { loadCommands, loadEvents } = require( "./utils/load_files" );
const { loadCommandsToGuild } = require( "./utils/register_commands" );


const intentsList = [
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_PRESENCES,
	Intents.FLAGS.GUILD_VOICE_STATES,
]
const client = new Client( { intents: intentsList } );


client.commands = new Collection();
(
	async () => {
		await loadCommands( client );
		await loadEvents( client );

		await loadCommandsToGuild( client.id )
	}
)();