module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    // Active les méthodes privées
    ["@babel/plugin-proposal-private-methods", { loose: true }],

    // Si besoin pour les propriétés privées
    ["@babel/plugin-proposal-private-property-in-object", { loose: true }],

    // Toujours mettre le plugin reanimated en dernier
    "react-native-reanimated/plugin",
  ],
};
