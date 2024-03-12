// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

/* *
 * We create a language strings object containing all of our strings.
 * The keys for each string will then be referenced in our code, e.g. handlerInput.t('WELCOME_MSG').
 * The localisation interceptor in index.js will automatically choose the strings
 * that match the request's locale.
 * */

module.exports = {
    en: {
        translation: {
            WELCOME_MSG: 'Welcome, you can say Hello or Help. Which would you like to try?',
            HELLO_MSG: 'Hello World!',
            HELP_MSG: 'You can say hello to me! How can I help?',
            GOODBYE_MSG: 'Goodbye!',
            REFLECTOR_MSG: 'You just triggered {{intentName}}',
            FALLBACK_MSG: 'Sorry, I don\'t know about that. Please try again.',
            ERROR_MSG: 'Sorry, I had trouble doing what you asked. Please try again.'
        }
    },
    es: {
        translation: {
            WELCOME_MSG: 'Bienvenido, puedes decir Hola o Ayuda. Cual prefieres?',
            HELLO_MSG: 'Hola Mundo!',
            HELP_MSG: 'Puedes decirme hola. Cómo te puedo ayudar?',
            GOODBYE_MSG: 'Hasta luego!',
            REFLECTOR_MSG: 'Acabas de activar {{intentName}}',
            FALLBACK_MSG: 'Lo siento, no se nada sobre eso. Por favor inténtalo otra vez.',
            ERROR_MSG: 'Lo siento, ha habido un error. Por favor inténtalo otra vez.'
        }
    },
    de: {
        translation: {
            WELCOME_MSG: 'Wilkommen, du kannst Hallo oder Hilfe sagen. Was würdest du gern tun?',
            HELLO_MSG: 'Hallo!',
            HELP_MSG: 'Du kannst hallo zu mir sagen. Wie kann ich dir helfen?',
            GOODBYE_MSG: 'Tschüss!',
            REFLECTOR_MSG: 'Du hast gerade {{intentName}} ausgelöst',
            FALLBACK_MSG: 'Es tut mir leid, ich weiss das nicht. Bitte versuche es erneut.',
            ERROR_MSG: 'Es tut mir leid, ich konnte das nicht machen. Bitte versuche es erneut.'
        }
    },
    fr: {
        translation: {
            WELCOME_MSG: 'Bienvenue sur le génie des salutations, dites-moi bonjour et je vous répondrai',
            HELLO_MSG: 'Bonjour à tous!',
            HELP_MSG: 'Dites-moi bonjour et je vous répondrai!',
            GOODBYE_MSG: 'Au revoir!',
            REFLECTOR_MSG: 'Vous avez invoqué l\'intention {{intentName}}',
            FALLBACK_MSG: 'Désolé, je ne sais pas. Pouvez-vous reformuler?',
            ERROR_MSG: 'Désolé, je n\'ai pas compris. Pouvez-vous reformuler?'
        }
    },
    it: {
        translation: {
            WELCOME_MSG: 'Buongiorno! Puoi salutarmi con un ciao, o chiedermi aiuto. Cosa preferisci fare?',
            HELLO_MSG: 'Ciao!',
            HELP_MSG: 'Dimmi ciao e io ti risponderò! Come posso aiutarti?',
            GOODBYE_MSG: 'A presto!',
            REFLECTOR_MSG: 'Hai invocato l\'intento {{intentName}}',
            FALLBACK_MSG: 'Perdonami, penso di non aver capito bene. Riprova.',
            ERROR_MSG: 'Scusa, c\'è stato un errore. Riprova.'
        }
    }
}