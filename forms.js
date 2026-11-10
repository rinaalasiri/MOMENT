const options = (values, selected) =>
  values
    .map(
      ([value, label]) =>
        '<option value="' +
        escapeHtml(value) +
        '" ' +
        (value === selected ? 'selected' : '') +
        '>' +
        escapeHtml(label) +
        '</option>',
    )
    .join('');
const field = (label, name, type = 'text', value = '', attributes = '') =>
  '<label>' +
  label +
  '<input name="' +
  name +
  '" type="' +
  type +
  '" value="' +
  escapeHtml(value) +
  '" ' +
  attributes +
  '></label>';
const select = (label, name, values, selected) =>
  '<label>' +
  label +
  '<select name="' +
  name +
  '">' +
  options(values, selected) +
  '</select></label>';
