/**
 * @author Benjamin Guirlet
 * @description
 *      Handler for the command 'forceskip'.
 */


const { EMBED_COLOR, ADMIN_ID } = require( "../../files/config.json" );
const { checkUserIsConnected } = require( "../../utils/utils" );

const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction, Client, MessageEmbed } = require( "discord.js" );



const slashCommand = new SlashCommandBuilder()
	.setName( "forceskip" )
	.setDescription( "Passe à la musique suivante sans proposer de vote. Il faut les permissions MANAGE_MESSAGES!" );


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

	// Checking if the user has the permission to use this command.
	const member = await interaction.guild.members.fetch( interaction.user.id );
	if ( !member.permissions.has( "MANAGE_MESSAGES" ) || member.id !== ADMIN_ID ) {
		await interaction.reply( {
			embeds: [
				new MessageEmbed()
					.setColor( EMBED_COLOR )
					.setAuthor( "| Tu n'as pas les droits!", interaction.user.avatarURL() )
			]
		});
	}

	const guildId = interaction.guildId;
	if ( client.guildsData.has( guildId ) ) {
		client.guildsData.get( guildId ).player.stop();
		await interaction.reply( {
			embeds: [
				new MessageEmbed()
					.setColor( EMBED_COLOR )
					.setAuthor( "| Passage à la musique suivante!", interaction.user.avatarURL() )
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