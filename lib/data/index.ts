import "server-only";

import { Role } from "@prisma/client";
import { PORTAL_DATA_SOURCE } from "@/lib/env/database";
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
};

const portalDataStore: DataStore = PORTAL_DATA_SOURCE === "database" ? databaseStore : csvStore;

export const getAdmins = () => portalDataStore.getAdmins();
export const getClients = () => portalDataStore.getClients();
export const getCandidates = () => portalDataStore.getCandidates();
export const getAssessments = () => portalDataStore.getAssessments();
export const getResults = () => portalDataStore.getResults();
export const getAssessmentById = (assessmentId: string) => portalDataStore.getAssessmentById(assessmentId);
export const getAssessmentsForCandidateEmail = (email: string) => portalDataStore.getAssessmentsForCandidateEmail(email);
export const updateCandidate = (candidateId: string, update: Partial<DataCandidate>) =>
  portalDataStore.updateCandidate(candidateId, update);
export const updateAssessment = (assessmentId: string, update: Partial<PortalAssessmentCard>) =>
  portalDataStore.updateAssessment(assessmentId, update);

export const resetDevData = async () => {
  if (!IS_DEV) {
    throw new Error("Development data reset is unavailable outside dev mode.");
  }
  return csvStore.resetDevData();
};

export const getDevAccessProfiles = async (): Promise<DevAccessProfile[]> => {
  if (!IS_DEV) {
    return [];
  }
  return csvStore.getDevAccessProfiles();
};

export const authenticateDevCredentials = (input: {
  email: string;
  password: string;
  role?: Role;
}) => {
  if (!IS_DEV) {
    return Promise.resolve<DevCredentialUser | null>(null);
  }
  return csvStore.authenticateDevCredentials(input);
};

export const DATA_SOURCE = PORTAL_DATA_SOURCE;
