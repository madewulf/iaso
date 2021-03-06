import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import moment from 'moment';

import { withStyles, TableCell, TableRow } from '@material-ui/core';

import GeoJsonMap from '../../../components/maps/GeoJsonMapComponent';
import { textPlaceholder } from '../../../constants/uiConstants';

import MESSAGES from '../../forms/messages';
import { MESSAGES as LINKS_MESSAGES } from '../messages';

const styles = theme => ({
    cell: {
        minWidth: 180,
    },
    isDifferent: {
        backgroundColor: theme.palette.secondary.main,
        color: 'white',
    },
    isDifferentValidated: {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
    },
    cellMap: {
        margin: -theme.spacing(2),
    },
});

const ignoredKeys = [
    'id',
    'source_id',
    'sub_source_id',
    'org_unit_type_id',
    'has_geo_json',
    'org_unit_type',
    'parent',
    'parent_id',
    'sub_source',
    'source',
    'source_ref',
];

const renderValue = (linkKey, value, classes) => {
    if (!value || value.toString().length === 0) return textPlaceholder;
    switch (linkKey) {
        case 'geo_json': {
            return (
                <div className={classes.cellMap}>
                    <GeoJsonMap geoJson={value} />
                </div>
            );
        }
        case 'status': {
            return value ? (
                <FormattedMessage {...LINKS_MESSAGES.validated} />
            ) : (
                <FormattedMessage {...LINKS_MESSAGES.notValidated} />
            );
        }
        case 'groups': {
            return value.map(g => g.name).join(', ');
        }
        case 'created_at':
        case 'updated_at': {
            return moment.unix(value).format('DD/MM/YYYY HH:mm');
        }

        default:
            return value.toString();
    }
};

const LinksValue = ({
    linkKey,
    value,
    isDifferent,
    classes,
    intl,
    validated,
}) => {
    const { formatMessage } = intl;
    if (ignoredKeys.indexOf(linkKey) !== -1) return null;

    const differentClass = validated
        ? classes.isDifferentValidated
        : classes.isDifferent;
    return (
        <TableRow>
            <TableCell className={classes.cell}>
                {MESSAGES[linkKey] && formatMessage(MESSAGES[linkKey])}
                {!MESSAGES[linkKey] && linkKey}
            </TableCell>
            <TableCell className={isDifferent ? differentClass : null}>
                {renderValue(linkKey, value, classes)}
            </TableCell>
        </TableRow>
    );
};

LinksValue.defaultProps = {
    value: null,
    validated: false,
};

LinksValue.propTypes = {
    intl: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    linkKey: PropTypes.string.isRequired,
    value: PropTypes.any,
    isDifferent: PropTypes.bool.isRequired,
    validated: PropTypes.bool,
};

export default withStyles(styles)(injectIntl(LinksValue));
