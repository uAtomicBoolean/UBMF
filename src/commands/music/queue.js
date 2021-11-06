/**
 * @author Benjamin Guirlet
 * @description
 *      Handler for the command 'queue'.
 */


const { EMBED_COLOR } = require( "../../files/config.json" );
const { checkUserIsConnected } = require( "../../utils/utils" );

const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction, Client, MessageEmbed } = require( "discord.js" );



const slashCommand = new SlashCommandBuilder()
	.setName( "queue" )
	.setDescription( "Affiche les 10 premières musiques de la queue." );


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

		let textQueue = "";
		let cpt = 1;
		client.guildsData.get( guildId ).queue.forEach( (music) => {
			if ( cpt === 11 ) return;
			textQueue += `**${cpt}.** ${music.title} [${music.duration}]\n`;
			++cpt;
		});

		const embedQueue = new MessageEmbed()
			.setColor( EMBED_COLOR )
			.setAuthor( "| File d'attente", interaction.user.avatarURL() )
			.setDescription( textQueue );

		await interaction.reply( { embeds: [ embedQueue] } );
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