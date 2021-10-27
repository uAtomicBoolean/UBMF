/**
 * @author Benjamin Guirlet
 * @file
 * 		Handler for the 'interactionCreate' event.
 * 		The main code is in the function 'execute()'.
 */


const { CommandInteraction, ButtonInteraction, Client } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * The handler for the event 'interactionCreate'.
 * It is called whenever an interaction is created.
 * It can be a button pressed, a slash command executed, etc.
 * @param {CommandInteraction|ButtonInteraction} interaction The interaction that triggered the event.
 * @param {Client} client The client that created the interaction.
 */
async function execute( interaction, client ) {
	if ( interaction.isCommand() ) {
		if ( !interaction.inGuild() ) {
			await interaction.reply( "You cannot use the *set* command outside of a server!" );
			return;
		}
		await client.commands.get( interaction.commandName ).execute( interaction, client );
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: 'interactionCreate',
	execute
};