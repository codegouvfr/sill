import { type LocalizedString, useResolveLocalizedString } from "./i18n";
import { useCallback } from "react";

const organizationFullNameByAcronym: Record<string, LocalizedString> = {
    /* spell-checker: disable */
    "INSEE": {
        "fr": "Institut National de la Statistique et des Études Économiques",
        "en": "National Institute of Statistics and Economic Studies"
    },
    "MTE": {
        "fr": "Ministère de la Transition Écologique",
        "en": "Ministry of Ecological Transition"
    },
    "MEFR": {
        "fr": "Ministère de l'Économie, des Finances et de la Relance",
        "en": "Ministry of Economy, Finance and Recovery"
    },
    "MS": {
        "fr": "Ministère des Solidarités et de la Santé",
        "en": "Ministry of Solidarity and Health"
    },
    "MEAE": {
        "fr": "Ministère de l'Europe et des Affaires Étrangères",
        "en": "Ministry of Europe and Foreign Affairs"
    },
    "MI": { "fr": "Ministère de l'Intérieur", "en": "Ministry of the Interior" },
    "MJ": { "fr": "Ministère de la Justice", "en": "Ministry of Justice" },
    "MC": { "fr": "Ministère de la Culture", "en": "Ministry of Culture" },
    "MESR": {
        "fr": "Ministère de l'Enseignement Supérieur et de la Recherche",
        "en": "Ministry of Higher Education and Research"
    },
    "MTR": { "fr": "Ministère du Travail", "en": "Ministry of Labor" },
    "MD": { "fr": "Ministère de la Défense", "en": "Ministry of Defense" },
    "MA": {
        "fr": "Ministère de l'Agriculture et de l'Alimentation",
        "en": "Ministry of Agriculture and Food"
    },
    "MLETR": { "fr": "Ministère de la Mer", "en": "Ministry of the Sea" },
    "MCC": {
        "fr": "Ministère de la Cohésion des Territoires et des Relations avec les Collectivités Territoriales",
        "en": "Ministry of Territorial Cohesion and Relations with Local Authorities"
    },
    "MEN": {
        "fr": "Ministère de l'Éducation nationale",
        "en": "Ministry of National Education"
    },
    "DAJ": {
        "fr": "Direction des Affaires Juridiques",
        "en": "Directorate of Legal Affairs"
    },
    "DINUM": {
        "fr": "Direction Interministérielle du Numérique",
        "en": "Interministerial Directorate of Digital"
    },
    "CNIL": {
        "fr": "Commission Nationale de l'Informatique et des Libertés",
        "en": "National Commission for Data Protection and Liberties"
    },
    "ACOSS": {
        "fr": "Agence Centrale des Organismes de Sécurité Sociale",
        "en": "Central Agency of Social Security Organizations"
    },
    "DGFIP": {
        "fr": "Direction Générale des Finances Publiques",
        "en": "General Directorate of Public Finances"
    },
    "ANSSI": {
        "fr": "Agence Nationale de la Sécurité des Systèmes d'Information",
        "en": "National Agency for the Security of Information Systems"
    },
    "AMF": {
        "fr": "Autorité des Marchés Financiers",
        "en": "Financial Markets Authority"
    },
    "CNRS": {
        "fr": "Centre National de la Recherche Scientifique",
        "en": "National Center for Scientific Research"
    },
    "INPI": {
        "fr": "Institut National de la Propriété Industrielle",
        "en": "National Institute of Industrial Property"
    },
    "PREF": { "fr": "Préfectures", "en": "Prefectures" },
    "CAF": { "fr": "Caisse d'Allocations Familiales", "en": "Family Allowance Fund" },
    "CPAM": {
        "fr": "Caisse Primaire d'Assurance Maladie",
        "en": "Primary Health Insurance Fund"
    },
    "MSA": { "fr": "Mutualité Sociale Agricole", "en": "Agricultural Social Mutuality" },
    "ANSM": {
        "fr": "Agence Nationale de Sécurité du Médicament et des produits de santé",
        "en": "National Agency for the Safety of Medicines and Health Products"
    },
    "ADEME": {
        "fr": "Agence de l'environnement et de la maîtrise de l'énergie",
        "en": "Environment and Energy Management Agency"
    },
    "ARS": { "fr": "Agences Régionales de Santé", "en": "Regional Health Agencies" },
    "ANAH": { "fr": "Agence Nationale de l'Habitat", "en": "National Housing Agency" },
    "CNOUS": {
        "fr": "Centre National des Œuvres Universitaires et Scolaires",
        "en": "National Center for University and School Services"
    },
    "CROUS": {
        "fr": "Centres Régionaux des Œuvres Universitaires et Scolaires",
        "en": "Regional Centers for University and School Services"
    },
    "CGET": {
        "fr": "Commissariat Général à l'Égalité des Territoires",
        "en": "General Commission for Territorial Equality"
    },
    "DGCCRF": {
        "fr": "Direction Générale de la Concurrence, de la Consommation et de la Répression des Fraudes",
        "en": "Directorate General for Competition, Consumer Affairs and Fraud Control"
    },
    "ASN": { "fr": "Autorité de Sûreté Nucléaire", "en": "Nuclear Safety Authority" },
    "ANDRA": {
        "fr": "Agence Nationale pour la Gestion des Déchets Radioactifs",
        "en": "National Agency for Radioactive Waste Management"
    },
    "BRGM": {
        "fr": "Bureau de Recherches Géologiques et Minières",
        "en": "Geological and Mining Research Bureau"
    },
    "CNES": {
        "fr": "Centre National d'Études Spatiales",
        "en": "National Center for Space Studies"
    },
    "CNSA": {
        "fr": "Caisse Nationale de Solidarité pour l'Autonomie",
        "en": "National Solidarity Fund for Autonomy"
    },
    "CSA": {
        "fr": "Conseil Supérieur de l'Audiovisuel",
        "en": "Superior Council of Audiovisual"
    },
    "CRE": {
        "fr": "Commission de Régulation de l'Énergie",
        "en": "Energy Regulatory Commission"
    },
    "CNAF": {
        "fr": "Caisse Nationale des Allocations Familiales",
        "en": "National Family Allowance Fund"
    },
    "CNAV": {
        "fr": "Caisse Nationale d'Assurance Vieillesse",
        "en": "National Old-age Insurance Fund"
    },
    "CNRACL": {
        "fr": "Caisse Nationale de Retraite des Agents des Collectivités Locales",
        "en": "National Pension Fund for Local Government Employees"
    },
    "INRAE": {
        "fr": "Institut National de Recherche pour l'Agriculture, l'Alimentation et l'Environnement",
        "en": "National Research Institute for Agriculture, Food and the Environment"
    },
    "IRSN": {
        "fr": "Institut de Radioprotection et de Sûreté Nucléaire",
        "en": "Institute for Radiological Protection and Nuclear Safety"
    },
    "ONF": { "fr": "Office National des Forêts", "en": "National Forests Office" },
    "Pôle Emploi": { "fr": "Pôle Emploi", "en": "Employment Center" },
    "RATP": {
        "fr": "Régie Autonome des Transports Parisiens",
        "en": "Autonomous Parisian Transportation Administration"
    },
    "SNCF": {
        "fr": "Société Nationale des Chemins de fer Français",
        "en": "National Society of French Railways"
    },
    "CNAM": {
        "fr": "Caisse Nationale d'Assurance Maladie",
        "en": "National Health Insurance Fund"
    },
    "CNED": {
        "fr": "Centre National d'Enseignement à Distance",
        "en": "National Distance Education Center"
    },
    "INED": {
        "fr": "Institut National d'Études Démographiques",
        "en": "National Institute for Demographic Studies"
    },
    "OFII": {
        "fr": "Office Français de l'Immigration et de l'Intégration",
        "en": "French Office for Immigration and Integration"
    },
    "ANRU": {
        "fr": "Agence Nationale pour la Rénovation Urbaine",
        "en": "National Agency for Urban Renewal"
    },
    "DGAC": {
        "fr": "Direction Générale de l'Aviation Civile",
        "en": "Directorate General for Civil Aviation"
    },
    "IFPEN": {
        "fr": "Institut Français du Pétrole et des Énergies Nouvelles",
        "en": "French Institute of Petroleum and New Energies"
    },
    "IGN": {
        "fr": "Institut National de l'Information Géographique et Forestière",
        "en": "National Institute of Geographic and Forestry Information"
    },
    "AFB": {
        "fr": "Agence Française pour la Biodiversité",
        "en": "French Agency for Biodiversity"
    },
    "ANCT": {
        "fr": "Agence Nationale de la Cohésion des Territoires",
        "en": "National Agency for Territorial Cohesion"
    },
    "ANR": {
        "fr": "Agence Nationale de la Recherche",
        "en": "National Research Agency"
    },
    "ART": {
        "fr": "Autorité de Régulation des Transports",
        "en": "Transport Regulatory Authority"
    },
    "ASP": {
        "fr": "Agence de Services et de Paiement",
        "en": "Payment and Services Agency"
    },
    "CADA": {
        "fr": "Commission d'Accès aux Documents Administratifs",
        "en": "Commission for Access to Administrative Documents"
    },
    "CNAPE": {
        "fr": "Conseil National des Politiques de Lutte contre la Pauvreté et l'Exclusion sociale",
        "en": "National Council of Policies to Combat Poverty and Social Exclusion"
    },
    "CNFPT": {
        "fr": "Centre National de la Fonction Publique Territoriale",
        "en": "National Center for Territorial Public Service"
    },
    "CNS": {
        "fr": "Conseil National du Sida et des Hépatites Virales",
        "en": "National Council for AIDS and Viral Hepatitis"
    },
    "CNC": {
        "fr": "Centre National du Cinéma et de l'Image Animée",
        "en": "National Center for Cinema and Moving Images"
    },
    "CNESCO": {
        "fr": "Conseil National d'Évaluation du Système Scolaire",
        "en": "National Council for the Evaluation of the School System"
    },
    "CNFOM": {
        "fr": "Conseil National des Forêts et des Milieux Naturels",
        "en": "National Council for Forests and Natural Environments"
    },
    "CNR": {
        "fr": "Conseil National de la Résistance",
        "en": "National Council of Resistance"
    },
    "DARES": {
        "fr": "Direction de l'Animation de la Recherche, des Études et des Statistiques",
        "en": "Directorate for Research, Studies and Statistics Coordination"
    },
    "DGALN": {
        "fr": "Direction Générale de l'Aménagement, du Logement et de la Nature",
        "en": "Directorate General for Planning, Housing and Nature"
    },
    "DGDDI": {
        "fr": "Direction Générale des Douanes et Droits Indirects",
        "en": "Directorate General of Customs and Indirect Rights"
    },
    "DGE": {
        "fr": "Direction Générale des Entreprises",
        "en": "Directorate General for Enterprises"
    },
    "DGOM": {
        "fr": "Direction Générale des Outre-Mer",
        "en": "Directorate General for Overseas Territories"
    },
    "DGT": {
        "fr": "Direction Générale du Travail",
        "en": "Directorate General for Labor"
    },
    "DGUHC": {
        "fr": "Direction Générale de l'Urbanisme, de l'Habitat et de la Construction",
        "en": "General Directorate of Urban Planning, Housing and Construction"
    },
    "DILA": {
        "fr": "Direction de l'Information Légale et Administrative",
        "en": "Directorate of Legal and Administrative Information"
    },
    "ENM": {
        "fr": "École Nationale de la Magistrature",
        "en": "National School of Magistrates"
    },
    "ENA": {
        "fr": "École Nationale d'Administration",
        "en": "National School of Administration"
    },
    "HALDE": {
        "fr": "Haute Autorité de Lutte contre les Discriminations et pour l'Égalité",
        "en": "High Authority for the Fight against Discrimination and for Equality"
    },
    "HCSP": {
        "fr": "Haut Conseil de la Santé Publique",
        "en": "High Council for Public Health"
    },
    "HCE": {
        "fr": "Haut Conseil à l'Égalité entre les femmes et les hommes",
        "en": "High Council for Gender Equality"
    },
    "HCFEA": {
        "fr": "Haut Conseil de la Famille, de l'Enfance et de l'Âge",
        "en": "High Council for the Family, Childhood and Age"
    },
    "HCFP": {
        "fr": "Haut Conseil des Finances Publiques",
        "en": "High Council of Public Finances"
    },
    "HCJ": {
        "fr": "Haut Conseil de la Justice",
        "en": "High Council for Justice"
    },
    "HCTISN": {
        "fr": "Haut Comité pour la Transparence et l'Information sur la Sécurité Nucléaire",
        "en": "High Committee for Transparency and Information on Nuclear Security"
    },
    "IFSTTAR": {
        "fr": "Institut Français des Sciences et Technologies des Transports, de l'Aménagement et des Réseaux",
        "en": "French Institute of Sciences and Technologies for Transport, Planning and Networks"
    },
    "INAO": {
        "fr": "Institut National de l'Origine et de la Qualité",
        "en": "National Institute of Origin and Quality"
    },
    "INERIS": {
        "fr": "Institut National de l'Environnement Industriel et des Risques",
        "en": "National Institute for Industrial Environment and Risks"
    },
    "IRCEM": {
        "fr": "Institut de Recherche et Coordination Acoustique/Musique",
        "en": "Institute for Research and Coordination in Acoustics/Music"
    },
    "IRSTEA": {
        "fr": "Institut National de Recherche en Sciences et Technologies pour l'Environnement et l'Agriculture",
        "en": "National Institute for Research in Environmental and Agricultural Sciences and Technologies"
    },
    "OFCE": {
        "fr": "Observatoire Français des Conjonctures",
        "en": "French Observatory of Economic Conditions"
    },
    "OFPRA": {
        "fr": "Office Français de Protection des Réfugiés et Apatrides",
        "en": "French Office for the Protection of Refugees and Stateless Persons"
    },
    "ORF": {
        "fr": "Office de Radiodiffusion Télévision Française",
        "en": "French Broadcasting and Television Office"
    },
    "RAE": { "fr": "Réseau des Acheteurs de l'État", "en": "State Buyers Network" },
    "RFF": { "fr": "Réseau Ferré de France", "en": "French Rail Network" },
    "RFI": { "fr": "Radio France Internationale", "en": "Radio France Internationale" },
    "RTE": {
        "fr": "Réseau de Transport d'Électricité",
        "en": "Electricity Transmission Network"
    },
    "SCNF": {
        "fr": "Service Central des Nouvelles Formations",
        "en": "Central Service of New Formations"
    },
    "SFIL": { "fr": "Société de Financement Local", "en": "Local Financing Company" },
    "SGA": {
        "fr": "Secrétariat Général pour l'Administration",
        "en": "General Secretariat for Administration"
    },
    "SIAAP": {
        "fr": "Syndicat Interdépartemental pour l'Assainissement de l'Agglomération Parisienne",
        "en": "Interdepartmental Union for the Sanitation of the Parisian Agglomeration"
    },
    "STIF": {
        "fr": "Syndicat des Transports d'Île-de-France",
        "en": "Île-de-France Transport Union"
    },
    "UNEDIC": {
        "fr": "Union Nationale pour l'Emploi dans l'Industrie et le Commerce",
        "en": "National Union for Employment in Industry and Commerce"
    },
    "URSSAF": {
        "fr": "Unions de Recouvrement des Cotisations de Sécurité Sociale et d'Allocations Familiales",
        "en": "Social Security and Family Allowance Contribution Collection Unions"
    },
    "CNSD": {
        "fr": "Conseil National des Services de Défense",
        "en": "National Council of Defense Services"
    },
    "ADEE": { "fr": "Agence de l'Eau", "en": "Water Agency" },
    "FNAL": {
        "fr": "Fonds National d'Aide au Logement",
        "en": "National Housing Assistance Fund"
    },
    "CNAMTS": {
        "fr": "Caisse Nationale de l'Assurance Maladie des Travailleurs Salariés",
        "en": "National Health Insurance Fund for Salaried Workers"
    },
    "CNPP": {
        "fr": "Centre National de Prévention et de Protection",
        "en": "National Center for Prevention and Protection"
    },
    "CNFPTLV": {
        "fr": "Centre National de la Fonction Publique Territoriale pour la Formation Tout au Long de la Vie",
        "en": "National Center for Territorial Public Service for Lifelong Training"
    },
    "DIRECCTE": {
        "fr": "Directions Régionales des Entreprises, de la Concurrence, de la Consommation, du Travail et de l'Emploi",
        "en": "Regional Directorates for Enterprises, Competition, Consumption, Labor and Employment"
    },
    "DRAAF": {
        "fr": "Directions Régionales de l'Alimentation, de l'Agriculture et de la Forêt",
        "en": "Regional Directorates for Food, Agriculture and Forestry"
    },
    "DRAC": {
        "fr": "Directions Régionales des Affaires Culturelles",
        "en": "Regional Directorates of Cultural Affairs"
    },
    "DRJSCS": {
        "fr": "Directions Régionales de la Jeunesse, des Sports et de la Cohésion Sociale",
        "en": "Regional Directorates for Youth, Sports and Social Cohesion"
    },
    "SHOM": {
        "fr": "Service Hydrographique et Océanographique de la Marine",
        "en": "Hydrographic and Oceanographic Service of the Navy"
    },
    "CEREMA": {
        "fr": "Centre d'Études et d'Expertise sur les Risques, l'Environnement, la Mobilité et l'Aménagement",
        "en": "Center for Studies and Expertise on Risks, Environment, Mobility and Urban Planning"
    },
    "APHP": {
        "fr": "Assistance Publique - Hôpitaux de Paris",
        "en": "Public Assistance - Paris Hospitals"
    },
    "INSERM": {
        "fr": "Institut National de la Santé et de la Recherche Médicale",
        "en": "National Institute of Health and Medical Research"
    },
    "Institut_Polytechnique": {
        "fr": "Institut Polytechnique de Paris",
        "en": "Paris Institute of Technology"
    },
    "ONAC": {
        "fr": "Office National des Anciens Combattants et Victimes de Guerre",
        "en": "National Office for Veterans and War Victims"
    },
    "other": {
        "fr": "Autre organisation publique",
        "en": "Other public organization"
    }
    /* spell-checker: enable */
};

export function useGetOrganizationFullName() {
    const { resolveLocalizedString } = useResolveLocalizedString();

    const getOrganizationFullName = useCallback(
        (organization: string) => {
            const organizationFullName = organizationFullNameByAcronym[organization];

            if (organizationFullName === undefined) {
                return organization;
            }

            return `${organization}: ${resolveLocalizedString(organizationFullName)}`;
        },
        [resolveLocalizedString]
    );

    return { getOrganizationFullName };
}
