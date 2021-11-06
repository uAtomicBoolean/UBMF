/**
 * @author Benjamin Guirlet
 * @description
 *      This file contains the functions that load the commands and events in the client.
 */


const fs = require( "fs" );
const { Client } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Load the commands into the client.
 * @param {Client} client The bot's client.
 */
async function loadCommands( client ) {
	const dirWindows = "./commands";
	const dirLinux = "src/commands";

	// Reading the commands' folders.
	fs.readdirSync( dirLinux ).forEach( sub_dir => {
		// Reading the commands in the current folder.
		const commandFiles = fs.readdirSync( `${dirLinux}/${sub_dir}` ).filter( file => file.endsWith( ".js" ) );

		for ( const file of commandFiles ) {
			// Using another pathname because require works from the current file path and not the project path.
			const command = require( `../commands/${sub_dir}/${file}` );
			client.commands.set( command.data.name, command );
		}
	})
}


/**
 * Load all the events into the client.
 * @param {Client} client The client where the events will be loaded.
 */
async function loadEvents( client ) {
	const dirWindows = "./events";
	const dirLinux = "src/events";

	// Reading the events' files.
	const eventFiles = fs.readdirSync( dirLinux ).filter(file => file.endsWith('.js'));
	for ( const file of eventFiles ) {
		const event = require( `../events/${file}` );
		if ( event.once ) {
			client.once( event.name, ( ...args ) => event.execute( ...args, client ) );
		} else {
			client.on( event.name, ( ...args ) => event.execute( ...args, client ) );
		}
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	loadCommands,
	loadEvents
}