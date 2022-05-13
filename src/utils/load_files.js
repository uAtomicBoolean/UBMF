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
	// The work directory is different between windows and linux.
	// const dir = process.platform === "win32" ? "./commands" : "src/commands";
	const dir = process.cwd() + "/commands"

	// Reading the commands' folders.
	fs.readdirSync( dir ).forEach( sub_dir => {
		// Reading the commands in the current folder.
		const commandFiles = fs.readdirSync( `${dir}/${sub_dir}` ).filter( file => file.endsWith( ".js" ) );

		for ( const file of commandFiles ) {
			// Using another pathname because require works from the current file path and not the project path.
			const command = require( `${dir}/${sub_dir}/${file}` );
			client.commands.set( command.data.name, command );
		}
	})
}


/**
 * Load all the events into the client.
 * @param {Client} client The client where the events will be loaded.
 */
async function loadEvents( client ) {
	// const dir = process.platform === "win32" ? "./events" : "src/events";
	const dir = process.cwd() + "/events"

	// Reading the events' files.
	const eventFiles = fs.readdirSync( dir ).filter(file => file.endsWith('.js'));
	for ( const file of eventFiles ) {
		const event = require( `${dir}/${file}` );
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