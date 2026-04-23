export enum ErrorModalType {
	ROUTE_NOT_FOUND =  'Route Not Found',
	NETWORK_ERROR = 'Network Error ',
	DOMAIN_ERROR = 'Error of Domain',
	FORBIDDEN = 'Path Not Found',
	UNAUTHORIZED = 'Domain is Unauthroized',
}

  export interface ErrorModalType {
  	type: ErrorModalType;
  	path?: string;
  	details?: string;
  	httpCode?: number;
  }

  interface ErrorModalConfig {
  	type: ErrorModalType;
  	httpCode: string;
  	icon: string;
  	title: string;
  	context: string;
  	accentColor: string;
  	badgeClass: string;
  	progressClass: string;
  }