import Excel from 'exceljs'

const NAME_COLUMN = 'Jména'
const PUNISHMENT_COLUMN = 'Trest'

export default async function (event, path) {
  const workbookReader = new Excel.stream.xlsx.WorkbookReader(path)
  const rows = []

  for await (const worksheetReader of workbookReader) {
    for await (const row of worksheetReader) {
      rows.push(row.values)
    }
  }

  const columnDescription = rows.shift()

  const enhancedRows = rows.map((row) => {
    let enhancedRow = {}
    for (const [index, value] of row.entries()) {
      if (index !== 0) {
        enhancedRow[columnDescription[index]] = value
      }
    }

    return enhancedRow
  })

  return {
    columns: columnDescription,
    content: enhancedRows
  }
}

function splitArrayValues (value) {
  let result = value

  if (typeof value === 'string') {
    if (value.indexOf(';') > -1) {
      result = value.split(';')
    }
  }

  return result
}

function extendPersonData (name, punishment) {
  const trimmedName = name.trim()
  const separatorPosition = trimmedName.indexOf(':')
  const id = separatorPosition > -1 ? trimmedName.slice(0, separatorPosition).trim() : 1
  const onlyName = trimmedName.slice(separatorPosition + 1).trim()

  if (Array.isArray(punishment)) {
    punishment = punishment.find(punishment => punishment.includes(id)).trim().split(': ')[1]
  }

  return {
    name: onlyName,
    judgement: punishment
  }
}

function extendPeople (row) {
  row.people = []

  if (Array.isArray(row[NAME_COLUMN])) {
    // eslint-disable-next-line no-unused-vars
    for (const [index, name] of row[NAME_COLUMN].entries()) {
      row.people.push(extendPersonData(name, row[PUNISHMENT_COLUMN]))
    }
  } else {
    row.people.push(extendPersonData(row[NAME_COLUMN], row[PUNISHMENT_COLUMN]))
  }

  return row
}