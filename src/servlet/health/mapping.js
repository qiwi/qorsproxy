import {UP, DOWN, UNKNOWN, OUT_OF_SERVICE} from './status';
import {OK, SERVICE_UNAVAILABLE} from '../const/status';

export const DEFAULT_CODE = OK;
export const DEFAULT_MAP = {
	[UP]: OK,
	[OUT_OF_SERVICE]: SERVICE_UNAVAILABLE,
	[DOWN]: SERVICE_UNAVAILABLE
};

export default DEFAULT_MAP;

/**
 * @param {string} status
 * @param {Object} [map=DEFAULT_MAP]
 * @param {number} [code=DEFAULT_CODE]
 * @returns {number}
 */
export function resolve(status, map=DEFAULT_MAP, code=DEFAULT_MAP) {
	// NOTE Inspired by Spring contract
	// https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-endpoints.html
	return map[status] || OK;
}