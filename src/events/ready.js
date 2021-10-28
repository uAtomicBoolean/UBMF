/**
 * @author Benjamin Guirlet
 * @file
 * 		Handler for the 'ready' event.
 * 		The main code is in the function 'execute()'.
 */


const { Client } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * The handler for the event 'ready'.
 * @param {Client} client The client that created the interaction.
 */
async function execute( client ) {
	console.log( "Ready!" );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: 'ready',
	execute
};