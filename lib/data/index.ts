import "server-only";

import { Role } from "@prisma/client";
import { IS_DEV } from "@/lib/env/isDev";
import * as databaseStore from "@/lib/data/databaseStore";
import * as csvStore from "@/lib/dev/csvStore";
import { DataAdmin, DataCandidate, DataClient, DataResult, DevAccessProfile, PortalAssessmentCard } from "@/lib/data/types";

type DevCredentialUser = {
  id: string;
  email: string;
  role: Role;
  name: string;
};

type DataStore = {
  getAdmins: () => Promise<DataAdmin[]>;
  getClients: () => Promise<DataClient[]>;
  getCandidates: () => Promise<DataCandidate[]>;
  getAssessments: () => Promise<PortalAssessmentCard[]>;
  getResults: () => Promise<DataResult[]>;
  getAssessmentById: (assessmentId: string) => Promise<PortalAssessmentCard | null>;
  getAssessmentsForCandidateEmail: (email: string) => Promise<PortalAssessmentCard[]>;
  updateCandidate: (candidateId: string, update: Partial<DataCandidate>) => Promise<DataCandidate | null>;
  updateAssessment: (assessmentId: string, update: Partial<PortalAssessmentCard>) => Promise<PortalAssessmentCard | null>;
  resetDevData: () => Promise<void>;
  getDevAccessProfiles: () => Promise<DevAccessProfile[]>;
  authenticateDevCredentials: (input: {
    email: string;
    password: string;
    role?: Role;
  }) => Promise<DevCredentialUser | null>;
};

const dataStore: DataStore = IS_DEV ? csvStore : databaseStore;

export const getAdmins = () => dataStore.getAdmins();
export const getClients = () => dataStore.getClients();
export const getCandidates = () => dataStore.getCandidates();
export const getAssessments = () => dataStore.getAssessments();
export const getResults = () => dataStore.getResults();
export const getAssessmentById = (assessmentId: string) => dataStore.getAssessmentById(assessmentId);
export const getAssessmentsForCandidateEmail = (email: string) => dataStore.getAssessmentsForCandidateEmail(email);
export const updateCandidate = (candidateId: string, update: Partial<DataCandidate>) =>
  dataStore.updateCandidate(candidateId, update);
export const updateAssessment = (assessmentId: string, update: Partial<PortalAssessmentCard>) =>
  dataStore.updateAssessment(assessmentId, update);
export const resetDevData = () => dataStore.resetDevData();
export const getDevAccessProfiles = () => dataStore.getDevAccessProfiles();
export const authenticateDevCredentials = (input: {
  email: string;
  password: string;
  role?: Role;
}) => dataStore.authenticateDevCredentials(input);

export const DATA_SOURCE = IS_DEV ? "csv-dev" : "database";
