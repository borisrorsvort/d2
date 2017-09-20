import Api from '../api/Api';

class GeoFeatures {
    constructor(orgUnits = [], userOrgUnits = [], displayProperty) {
        this.orgUnits = orgUnits;
        this.userOrgUnits = userOrgUnits;
        this.displayName = displayProperty;
    }

    byOrgUnit(orgUnits) {
        return new GeoFeatures([].concat(orgUnits), this.userOrgUnits, this.displayProperty);
    }

    byUserOrgUnit(userOrgUnits) {
        return new GeoFeatures(this.orgUnits, [].concat(userOrgUnits), this.displayProperty);
    }

    displayProperty(displayProperty) {
        return new GeoFeatures(this.orgUnits, this.userOrgUnits, displayProperty);
    }

    getAll() {
        const api = Api.getApi();
        const params = {};

        if (this.orgUnits.length) {
            params.ou = `ou:${this.orgUnits.join(';')}`;
        }

        if (this.userOrgUnits.length) {
            params.userOrgUnit = this.userOrgUnits.join(';');
        }

        if (this.displayName) {
            params.displayProperty = this.displayName;
        }

        return api.get('geoFeatures', params);
    }

    static getGeoFeatures(...args) {
        return new GeoFeatures(...args);
    }

    static DISPLAY_PROPERTY_NAME = 'NAME';
    static DISPLAY_PROPERTY_SHORTNAME = 'SHORTNAME';
    static USER_ORGUNIT = 'USER_ORGUNIT';
    static USER_ORGUNIT_CHILDREN = 'USER_ORGUNIT_CHILDREN';
    static USER_ORGUNIT_GRANDCHILDREN = 'USER_ORGUNIT_GRANDCHILDREN';
}

export default GeoFeatures;
