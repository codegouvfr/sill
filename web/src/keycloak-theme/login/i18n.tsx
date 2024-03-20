import { createUseI18n } from "keycloakify/login";

export const { useI18n } = createUseI18n({
    "en": {
        "home": "Home",
        "back": "Back",
        "alphanumericalCharsOnly": "Only alphanumerical characters",
        "administrativeEmail": "Administrative Email",
        "agencyName": "Agency Name",
        "connect": "Connect",
        "selfCredentials": "Or use your credentials",
        "email": "Your professional email",
        "email hint": "For example : name@agency.gouv.fr",
        "password": "Your password",
        "noAccount": "No account yet",
        "backToLogin": "Back to login",
        "you domain isn't allowed yet":
            "Your email domain isn't allowed yet. Contact us at ",
        "mail body": [
            "Hello, ",
            "Would you, assuming it's granted, add my domain to the accept list.  ",
            "",
            "Best regards,"
        ].join("\n"),
        "mail subject": "[SILL] Adding new mail domain to the accept list",
        "login using": "Login using",
        "what is franceConnect": "What is FranceConnect ?",
        "what is franceConnect title": "What is FranceConnect - new window",
        "organization": "Organization of attach"
    },
    "fr": {
        /* spell-checker: disable */
        "home": "Accueil",
        "back": "Retour",
        "alphanumericalCharsOnly": "Caractères alphanumériques uniquement",
        "administrativeEmail": "Email administratif",
        "agencyName": "Nom du service de rattachement",
        "connect": "Se connecter",
        "selfCredentials": "Ou utiliser vos identifiants",
        "email": "Votre adresse électronique professionnelle",
        "email hint": "Par exemple : prenom.nom@monadministration.gouv.fr",
        "password": "Votre mot de passe",
        "noAccount": "Pas encore de compte",
        "backToLogin": "Retour à la connexion",
        "you domain isn't allowed yet":
            "Votre domaine n'est pas encore autorisé. Contactez-nous à l'adresse: ",
        "mail body": [
            "Bonjour,",
            "Veuillez, sous réserve qu'il soit éligible, ajouter mon nom de domaineà la liste des domaines autorisés pour s'inscrire sur la plateforme SILL.",
            "",
            "Cordialement,"
        ].join("\n"),
        "mail subject": "[SILL] Autorisation d'un nouveau domaine pour l'inscription",
        "login using": "S'identifier avec",
        "what is franceConnect": "Qu'est-ce que FranceConnect ?",
        "what is franceConnect title": "Qu'est ce que FranceConnect - nouvelle fenêtre",
        "organization": "Organisme de rattachement"
        /* spell-checker: enable */
    }
});

export type I18n = NonNullable<ReturnType<typeof useI18n>>;
