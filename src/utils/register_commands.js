/**
 * @author Benjamin Guirlet
 * @file
 * 		This file is a script used when slash commands are added or modified so they can be updated on discord.
 * 		It can update the commands on all the servers or on some specified servers.
 */


const { REST } = require( "@discordjs/rest" );
const { Routes } = require( "discord-api-types/v9" );
const { TOKEN } = require( `${process.cwd()}/files/config.json` );
const fs = require( "fs" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Load all the commands into the newly joined/created server.
 * @param {string} clientId The client's ID.
 * @param {string} guildId The newly joined/created guild's ID.
 */
async function loadCommandsToGuild( clientId, guildId ) {
	// Loading the commands into an array.
	const commands = [];
	fs.readdirSync( "./commands" ).forEach( dir => {
		const commandFiles = fs.readdirSync( `./commands/${dir}` ).filter(file => file.endsWith('.js'));
		for ( const file of commandFiles ) {
			const command = require( `../commands/${dir}/${file}` );
			commands.push( command.data.toJSON() );
		}
	});

	const rest = new REST( { version: '9' } ).setToken( TOKEN );

	try {
		await rest.put(
			Routes.applicationGuildCommands( clientId, guildId ),
			{ body: commands },
		);
		console.log( "Loaded application (/) commands to guild : " + guildId );

	} catch (error) {
		console.error(error);
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	loadCommandsToGuild
}