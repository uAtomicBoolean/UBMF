/**
 * @author Benjamin Guirlet
 * @description
 *      Handler for the command 'pause'
 */


const { EMBED_COLOR } = require( "../../files/config.json" );
const { checkUserIsConnected } = require( "../../utils/utils" );

const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction, Client, MessageEmbed } = require( "discord.js" );



const slashCommand = new SlashCommandBuilder()
	.setName( "pause" )
	.setDescription( "Met en pause la musique en cours de lecture." );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * The commands function. It is executed when the slash command is called.
 * @param {CommandInteraction} interaction The interaction generated by the command execution.
 * @param {Client} client The bot's client.
 */
async function execute( interaction, client ) {
	if ( !(await checkUserIsConnected( interaction )) ) return;


	const guildId = interaction.guildId;
	if ( client.guildsData.has( guildId ) ) {
		client.guildsData.get( guildId ).player.pause( true );
		await interaction.reply( {
			embeds: [
				new MessageEmbed()
					.setColor( EMBED_COLOR )
					.setAuthor( "| Musique mise en pause!", interaction.user.avatarURL() )
			]
		});
	}
	else {
		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor( EMBED_COLOR )
					.setAuthor( "| Le bot n'est pas connecté à un vocal!", interaction.user.avatarURL() )
			]
		});
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	data: slashCommand,
	execute
}