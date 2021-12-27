/**
 * @author Benjamin Guirlet
 * @file
 * 		Handler for the 'guildCreate' event.
 * 		The main code is in the function 'execute()'.
 */


const { Client, Guild } = require( "discord.js" );
const { loadCommandsToGuild } = require( "../utils/register_commands" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * The handler for the event 'guildCreate'.
 * @param {Guild} guild The guild joined by the bot.
 * @param {Client} client The client that created the interaction.
 */
async function execute( guild, client ) {
	await loadCommandsToGuild( client.user.id, guild.id );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: 'guildCreate',
	execute
};
