"use strict";
/**
 * Lead Temperature Calculation Service
 *
 * This service handles the calculation and automatic updating of lead temperatures
 * based on interaction dates, success probabilities, and business rules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemperatureUtils = exports.leadTemperatureService = exports.LeadTemperatureService = void 0;
/**
 * Default temperature calculation configuration
 */
const DEFAULT_TEMPERATURE_CONFIG = {
    hotThreshold: {
        maxDaysSinceInteraction: 1,
        minSuccessProbability: 70
    },
    coldThreshold: {
        maxDaysSinceFollowup: 3
    },
    warmThreshold: {
        minSuccessProbability: 30,
        maxSuccessProbability: 70
    }
};
/**
 * Lead Temperature Calculation Service
 */
class LeadTemperatureService {
    constructor(config = DEFAULT_TEMPERATURE_CONFIG) {
        this.config = config;
    }
    /**
     * Calculate lead temperature based on business logic
     * Requirements: 4.1, 4.2, 4.3, 4.4
     */
    calculateLeadTemperature(lead) {
        const daysSinceLastInteraction = this.getDaysSinceLastInteraction(lead);
        const daysSinceLastFollowup = this.getDaysSinceLastFollowup(lead);
        const successProbability = lead.success_probability || 0;
        // Hot: Recent interaction AND high success probability
        // Requirement 4.1: Calculate as 'hot' when recent interaction exists AND success probability is above 70%
        if (daysSinceLastInteraction <= this.config.hotThreshold.maxDaysSinceInteraction &&
            successProbability >= this.config.hotThreshold.minSuccessProbability) {
            return 'hot';
        }
        // Cold: No follow-up for more than 3 days
        // Requirement 4.3: Calculate as 'cold' when no follow-up has occurred for more than 3 days
        if (daysSinceLastFollowup > this.config.coldThreshold.maxDaysSinceFollowup) {
            return 'cold';
        }
        // Warm: Moderate interaction OR success probability between 30-70%
        // Requirement 4.2: Calculate as 'warm' when moderate interaction exists OR success probability is between 30-70%
        return 'warm';
    }
    /**
     * Update lead temperature automatically when interactions or probabilities change
     * Requirement 4.4: Update lead temperature automatically when interactions or probabilities change
     */
    async updateLeadTemperature(lead) {
        const newTemperature = this.calculateLeadTemperature(lead);
        // Only update if temperature has changed
        if (lead.lead_temperature !== newTemperature) {
            lead.lead_temperature = newTemperature;
            // Trigger temperature update in database
            await this.persistTemperatureUpdate(lead.id, newTemperature);
            // Log temperature change as activity
            await this.logTemperatureChange(lead.id, lead.lead_temperature, newTemperature);
        }
        return newTemperature;
    }
    /**
     * Batch update temperatures for multiple leads
     */
    async batchUpdateTemperatures(leads) {
        const results = new Map();
        for (const lead of leads) {
            const newTemperature = await this.updateLeadTemperature(lead);
            results.set(lead.id, newTemperature);
        }
        return results;
    }
    /**
     * Get leads that need temperature updates
     */
    async getLeadsNeedingTemperatureUpdate() {
        // This would typically query the database for leads that:
        // 1. Have had recent interactions
        // 2. Have had probability changes
        // 3. Haven't been updated in the last hour
        // For now, return empty array - implementation depends on database layer
        return [];
    }
    /**
     * Schedule automatic temperature updates
     */
    async scheduleTemperatureUpdates() {
        // This would set up a background job to periodically update temperatures
        // Implementation depends on the job scheduling system being used
        console.log('Temperature update scheduler would be set up here');
    }
    /**
     * Get temperature distribution statistics
     */
    getTemperatureStats(leads) {
        const stats = { hot: 0, warm: 0, cold: 0 };
        for (const lead of leads) {
            const temperature = this.calculateLeadTemperature(lead);
            stats[temperature]++;
        }
        return stats;
    }
    /**
     * Get leads by temperature
     */
    getLeadsByTemperature(leads, temperature) {
        return leads.filter(lead => this.calculateLeadTemperature(lead) === temperature);
    }
    /**
     * Validate temperature calculation inputs
     */
    validateLeadForTemperatureCalculation(lead) {
        const errors = [];
        if (!lead.id) {
            errors.push('Lead ID is required');
        }
        if (lead.success_probability !== undefined &&
            (lead.success_probability < 0 || lead.success_probability > 100)) {
            errors.push('Success probability must be between 0 and 100');
        }
        if (lead.last_followup_date && !this.isValidDate(lead.last_followup_date)) {
            errors.push('Invalid last follow-up date format');
        }
        if (lead.last_interaction && !this.isValidDate(lead.last_interaction)) {
            errors.push('Invalid last interaction date format');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Private helper methods
     */
    getDaysSinceLastInteraction(lead) {
        if (!lead.last_interaction) {
            return Infinity; // No interaction recorded
        }
        const lastInteractionDate = new Date(lead.last_interaction);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastInteractionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    getDaysSinceLastFollowup(lead) {
        if (!lead.last_followup_date) {
            return Infinity; // No follow-up recorded
        }
        const lastFollowupDate = new Date(lead.last_followup_date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastFollowupDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }
    async persistTemperatureUpdate(leadId, temperature) {
        // This would update the database with the new temperature
        // Implementation depends on the database layer
        console.log(`Would update lead ${leadId} temperature to ${temperature}`);
    }
    async logTemperatureChange(leadId, oldTemperature, newTemperature) {
        // This would log the temperature change as an activity
        // Implementation depends on the activities module
        console.log(`Lead ${leadId} temperature changed from ${oldTemperature} to ${newTemperature}`);
    }
}
exports.LeadTemperatureService = LeadTemperatureService;
/**
 * Singleton instance for global use
 */
exports.leadTemperatureService = new LeadTemperatureService();
/**
 * Utility functions for temperature calculation
 */
exports.TemperatureUtils = {
    /**
     * Get temperature color for UI display
     */
    getTemperatureColor(temperature) {
        switch (temperature) {
            case 'hot':
                return '#ef4444'; // red-500
            case 'warm':
                return '#f59e0b'; // amber-500
            case 'cold':
                return '#6b7280'; // gray-500
            default:
                return '#6b7280';
        }
    },
    /**
     * Get temperature icon for UI display
     */
    getTemperatureIcon(temperature) {
        switch (temperature) {
            case 'hot':
                return '🔥';
            case 'warm':
                return '🟡';
            case 'cold':
                return '❄️';
            default:
                return '🟡';
        }
    },
    /**
     * Get temperature display name in Persian
     */
    getTemperatureDisplayName(temperature) {
        switch (temperature) {
            case 'hot':
                return 'داغ';
            case 'warm':
                return 'نیمه‌فعال';
            case 'cold':
                return 'سرد';
            default:
                return 'نامشخص';
        }
    },
    /**
     * Sort leads by temperature priority (hot first, then warm, then cold)
     */
    sortLeadsByTemperaturePriority(leads) {
        const temperatureOrder = { 'hot': 0, 'warm': 1, 'cold': 2 };
        return leads.sort((a, b) => {
            const aTemp = exports.leadTemperatureService.calculateLeadTemperature(a);
            const bTemp = exports.leadTemperatureService.calculateLeadTemperature(b);
            return temperatureOrder[aTemp] - temperatureOrder[bTemp];
        });
    }
};
