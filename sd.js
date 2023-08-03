// Tao api_key va dien vao Authorization o headers
// http://8.219.10.246:8080/create

const axios = require("axios");
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

const progressBarLength = 20;
const progressBarIcon = "▬";
const emptyProgressBarIcon = "▭";

const updateProgress = (initialMessage, progress) => {
  const filledBars = Math.round((progress / 100) * progressBarLength);
  const emptyBars = progressBarLength - filledBars;
  const progressString = `${progressBarIcon.repeat(filledBars)}${emptyProgressBarIcon.repeat(emptyBars)}`;
  const progressBar = new EmbedBuilder().setColor("Random").setDescription(`Fetching info... ${progress}%\n[${progressString}]`);
  initialMessage.edit({ content: "", embeds: [progressBar] });
};

module.exports = {
  name: "stablediffusion",
  description: "Stable Diffusion",
  options: [
    {
      name: "models",
      description: "Chọn models",
      required: true,
      type: 3,
      choices: [
        {
          name: "Anything V3",
          value: "anythingv3_0-pruned.ckpt [2700c435]",
        },
        {
          name: "Anything V4.5",
          value: "anything-v4.5-pruned.ckpt [65745d25]",
        },
        {
          name: "Anything V5",
          value: "anythingV5_PrtRE.safetensors [893e49b9]",
        },
        {
          name: "AbyssOrangeMix V3",
          value: "AOM3A3_orangemixs.safetensors [9600da17]",
        },
        {
          name: "MeinaMix Meina V9",
          value: "meinamix_meinaV9.safetensors [2ec66ab0]",
        },
        {
          name: "MeinaMix Meina V11",
          value: "meinamix_meinaV11.safetensors [b56ce717]",
        },
      ],
    },
    {
      name: "prompts",
      description: "Nhập prompts của bạn",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "negative_prompts",
      description: "Nhập negative_prompts của bạn",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "steps",
      description: "Nhập steps (10 - 50)",
      required: true,
      type: ApplicationCommandOptionType.Number,
      min_value: 10,
      max_value: 50,
    },
    {
      name: "cfg_scale",
      description: "Nhập cfc_scale (1 - 20)",
      required: true,
      type: ApplicationCommandOptionType.Number,
      min_value: 1,
      max_value: 20,
    },
    {
      name: "sampler",
      description: "Chọn sampler",
      required: true,
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "DPM++ 2M Karras",
          value: "DPM++ 2M Karras",
        },
        {
          name: "Euler",
          value: "Euler",
        },
        {
          name: "Euler a",
          value: "Euler a",
        },
        {
          name: "Heun",
          value: "Heun",
        },
        {
          name: "DPM++ SDE Karras",
          value: "DPM++ SDE Karras",
        },
        {
          name: "DDIM",
          value: "DDIM",
        },
      ],
    },
  ],
  timeout: 5000,
  run: async ({ interaction }) => {
    try {
      const models = interaction.options.getString("models");
      const sampler = interaction.options.getString("sampler");
      const prompts = interaction.options.getString("prompts");
      const negative_prompts = interaction.options.getString("negative_prompts");
      const steps = interaction.options.get("steps").value;
      const cfg_scale = interaction.options.get("cfg_scale").value;

      const initialMessage = await interaction.reply("Đang chuẩn bị khởi tạo hình ảnh !");
      updateProgress(initialMessage, 0);

      const requestData = JSON.stringify({
        new: true,
        prompt: prompts,
        model: models,
        negative_prompt: negative_prompts,
        steps: steps,
        cfg: cfg_scale,
        seed: -1,
        sampler: sampler,
        aspect_ratio: "landscape",
        upscale: true,
      });

      const response = await axios.post("http://8.219.10.246:8080/sd?v=" + Date.now(), requestData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "hECxcaBwE5u9BcZL2ichetOfpdBzkOtT5WM4miJanfvc1G64zJipFQlR3mM0UW",
        },
        responseType: "arraybuffer",
        onDownloadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (percent !== 100) {
            updateProgress(initialMessage, percent);
          }
        },
      });

      const imageBuffer = Buffer.from(response.data, "binary");
      updateProgress(initialMessage, 100);

      const infoEmbed = new EmbedBuilder()
        .setTitle("Stable Diffusion Image")
        .setColor("Random")
        .setDescription(`Model: ${models}\nSampler: ${sampler}\nSteps: ${steps}\nCfg Scale: ${cfg_scale}`)
        .setFooter({ text: "Powered by: truyentranh4f.link" });
      initialMessage.edit({ content: "", embeds: [infoEmbed] });
      interaction.channel.send({
        files: [
          {
            attachment: imageBuffer,
            name: `${Date.now()}.png`,
          },
        ],
      });
    } catch (err) {
      const queueError = new EmbedBuilder().setDescription(err.message).setColor("RANDOM");
      interaction.reply({ embeds: [queueError] });
    }
  },
};
