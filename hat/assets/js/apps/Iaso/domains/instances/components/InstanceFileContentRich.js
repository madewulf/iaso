import React from 'react';
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FunctionsIcon from '@material-ui/icons/Functions';
import CommentIcon from '@material-ui/icons/Comment';
import isPlainObject from 'lodash/isPlainObject';

import { textPlaceholder } from '../../../constants/uiConstants';

const useStyle = makeStyles(theme => ({
    tableCellHead: {
        fontWeight: 'bold',
        backgroundColor: theme.palette.gray,
        borderTop: 'none !important',
        borderLeft: 'none !important',
        borderRight: 'none !important',
        borderBottom: `1px solid ${theme.palette.ligthGray.border}  !important`,
    },
    tableCell: {
        backgroundColor: 'transparent',
        borderTop: 'none !important',
        borderLeft: 'none !important',
        borderRight: 'none !important',
        borderBottom: `1px solid ${theme.palette.ligthGray.border}  !important`,
        minWidth: '200px',
    },
    tableCellCalculated: {
        color: theme.palette.gray.main,
    },
    tableCellLabelWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    tableCellLabelIcon: {
        alignSelf: 'flex-start',
    },
    tableCellLabel: {
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        marginLeft: 5,
    },
    tableCellLabelName: {
        color: theme.palette.mediumGray.main,
    },
}));

/**
 * Translate the provided label if it is translatable
 *
 * @param label
 * @returns {*}
 */
function translateLabel(label) {
    // TODO: pick current locale - not trivial since keys could be "FR", "French", "En français"...
    if (isPlainObject(label)) {
        return label[Object.keys(label)[0]];
    }

    return label;
}

function getRawValue(descriptor, data) {
    const value = data[descriptor.name];
    if (value === undefined) {
        return textPlaceholder;
    }
    return value;
}
/**
 * Extract the value from data using the descriptor
 * (handles the different scenarios, such as select fields)
 *
 * @param descriptor
 * @param data
 * @returns {string|*}
 */
function getDisplayedValue(descriptor, data) {
    const value = data[descriptor.name];
    if (value === undefined) {
        return textPlaceholder;
    }

    switch (descriptor.type) {
        case 'select_one':
        case 'select one': {
            const choice = descriptor.children.find(c => c.name === value);
            return choice !== undefined
                ? translateLabel(choice.label)
                : textPlaceholder;
        }
        case 'select_multiple':
        case 'select multiple': {
            const choices = descriptor.children.filter(c =>
                value.split(' ').includes(c.name),
            );
            return choices.length > 0
                ? choices.map(choice => translateLabel(choice.label)).join(', ')
                : textPlaceholder;
        }
        default:
            return value !== '' ? value : textPlaceholder;
    }
}

export default function InstanceFileContentRich({
    instanceData,
    formDescriptor,
}) {
    return (
        <Table>
            <TableBody>
                {formDescriptor.children
                    .filter(c => c.name !== 'meta')
                    .map(childDescriptor => (
                        <FormChild
                            key={childDescriptor.name}
                            descriptor={childDescriptor}
                            data={instanceData}
                        />
                    ))}
            </TableBody>
        </Table>
    );
}

InstanceFileContentRich.propTypes = {
    instanceData: PropTypes.object.isRequired,
    formDescriptor: PropTypes.object.isRequired,
};

function FormChild({ descriptor, data }) {
    switch (descriptor.type) {
        case 'repeat':
            return data[descriptor.name] ? (
                data[descriptor.name].map((subdata, index) => (
                    <FormGroup
                        key={`repeat-${index}`}
                        descriptor={descriptor}
                        data={subdata}
                    />
                ))
            ) : (
                <></>
            );
        case 'group':
            return <FormGroup descriptor={descriptor} data={data} />;
        case 'start':
        case 'end':
        case 'today':
        case 'deviceid':
        case 'subscriberid':
        case 'simserial':
        case 'phonenumber':
            return <FormMetaField descriptor={descriptor} data={data} />;
        case 'note':
            return <FormNoteField descriptor={descriptor} />;
        case 'calculate':
            return <FormCalculatedField descriptor={descriptor} data={data} />;
        default:
            return <FormField descriptor={descriptor} data={data} />;
    }
}
FormChild.propTypes = {
    descriptor: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
};

function FormGroup({ descriptor, data }) {
    const classes = useStyle();

    return (
        <>
            <TableRow>
                <TableCell
                    colSpan={2}
                    align="center"
                    className={classes.tableCellHead}
                >
                    <Label descriptor={descriptor} />
                </TableCell>
            </TableRow>
            {descriptor.children.map(childDescriptor => (
                <FormChild
                    key={childDescriptor.name}
                    descriptor={childDescriptor}
                    data={data}
                />
            ))}
        </>
    );
}
FormGroup.propTypes = {
    descriptor: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
};

function FormField({ descriptor, data }) {
    const classes = useStyle();

    return (
        <TableRow>
            <TableCell className={classes.tableCell}>
                <Label descriptor={descriptor} />
            </TableCell>
            <TableCell
                className={classes.tableCell}
                align="right"
                title={getRawValue(descriptor, data)}
            >
                {getDisplayedValue(descriptor, data)}
            </TableCell>
        </TableRow>
    );
}
FormField.propTypes = {
    descriptor: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
};

function FormCalculatedField({ descriptor, data }) {
    const classes = useStyle();

    return (
        <TableRow>
            <TableCell className={classes.tableCell}>
                <div className={classes.tableCellLabelWrapper}>
                    <FunctionsIcon
                        color="disabled"
                        className={classes.tableCellLabelIcon}
                    />
                    <Label
                        descriptor={descriptor}
                        tooltip={descriptor.bind.calculate}
                    />
                </div>
            </TableCell>
            <TableCell className={classes.tableCell} align="right">
                {getDisplayedValue(descriptor, data)}
            </TableCell>
        </TableRow>
    );
}
FormCalculatedField.propTypes = {
    descriptor: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
};

function FormMetaField({ descriptor, data }) {
    const classes = useStyle();

    return (
        <TableRow>
            <TableCell className={classes.tableCell} colSpan={2}>
                <Label
                    descriptor={descriptor}
                    value={getDisplayedValue(descriptor, data)}
                />
            </TableCell>
        </TableRow>
    );
}
FormMetaField.propTypes = {
    descriptor: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
};

function FormNoteField({ descriptor }) {
    const classes = useStyle();

    return (
        <TableRow>
            <TableCell className={classes.tableCell} colSpan={2}>
                <div className={classes.tableCellLabelWrapper}>
                    <CommentIcon
                        color="disabled"
                        className={classes.tableCellLabelIcon}
                    />
                    <Label descriptor={descriptor} />
                </div>
            </TableCell>
        </TableRow>
    );
}
FormNoteField.propTypes = {
    descriptor: PropTypes.object.isRequired,
};

function Label({ descriptor, value, tooltip }) {
    const classes = useStyle();

    let label = descriptor.name;
    let showNameHint = false;
    if ('label' in descriptor) {
        label = translateLabel(descriptor.label);

        if (value !== null) {
            // useful for meta questions, whose labels are like "subscriberid ${subscriberid}"
            label = label.replace(`\${${descriptor.name}}`, value);
        } else {
            showNameHint = true;
        }
    }

    const labelElement = (
        <div className={classes.tableCellLabel}>
            {label.replace(/(<([^>]+)>)/gi, '')}
            {showNameHint && (
                <div className={classes.tableCellLabelName}>
                    {descriptor.name}
                </div>
            )}
        </div>
    );

    return tooltip === null ? (
        labelElement
    ) : (
        <Tooltip size="small" placement="right-start" title={tooltip}>
            {labelElement}
        </Tooltip>
    );
}
Label.defaultProps = {
    value: null,
    tooltip: null,
};
Label.propTypes = {
    descriptor: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tooltip: PropTypes.string,
};
